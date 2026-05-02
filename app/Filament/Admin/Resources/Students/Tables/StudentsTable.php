<?php

namespace App\Filament\Admin\Resources\Students\Tables;

use App\Models\Student;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class StudentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $tenant = \Filament\Facades\Filament::getTenant();

                if ($tenant) {
                    return $query->where('organization_id', $tenant->id);
                }

                return $query->whereRaw('1 = 0');
            })

            ->columns([
                TextColumn::make('firstname')
                    ->label('Имя')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('lastname')
                    ->label('Фамилия')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('username')
                    ->label('Telegram')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Telegram скопирован'),

                BadgeColumn::make('role')
                    ->label('Роль')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'guest' => 'Гость',
                        'student' => 'Студент',
                        'premium' => 'Премиум',
                        default => $state,
                    })
                    ->colors([
                        'guest' => 'gray',
                        'student' => 'primary',
                        'premium' => 'warning',
                    ]),

                TextColumn::make('score')
                    ->label('Баллы')
                    ->numeric()
                    ->sortable()
                    ->badge()
                    ->color('success'),

                TextColumn::make('rank')
                    ->label('Ранг')
                    ->searchable(),

                TextColumn::make('courses_count')
                    ->label('Курсов')
                    ->counts('courses')
                    ->badge()
                    ->color('info'),

                TextColumn::make('created_at')
                    ->label('Дата регистрации')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            ->filters([
                SelectFilter::make('role')
                    ->label('Роль')
                    ->options([
                        'guest' => 'Гость',
                        'student' => 'Студент',
                        'premium' => 'Премиум',
                    ]),

                Filter::make('name')
                    ->form([
                        TextInput::make('name_search')
                            ->label('Поиск по имени/фамилии')
                            ->placeholder('Введите имя или фамилию...'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query->when(
                            $data['name_search'],
                            fn (Builder $query, $search) => $query->where(function ($q) use ($search) {
                                $q->where('firstname', 'like', "%{$search}%")
                                    ->orWhere('lastname', 'like', "%{$search}%");
                            })
                        );
                    }),
            ])

            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])

            ->bulkActions([
                // Массовые действия при необходимости
            ])

            ->headerActions([
                CreateAction::make()
                    ->label('Добавить студента'),
            ]);
    }
}
