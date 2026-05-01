<?php

namespace App\Filament\Admin\Resources\Courses\Tables;

use App\Models\Course;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class CoursesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $tenant = \Filament\Facades\Filament::getTenant();

                if ($tenant) {
                    return $query->where('organization_id', $tenant->id);
                }

                // Если тенанта нет (крайний случай), показываем пустой результат
                return $query->whereRaw('1 = 0');
            })

            ->columns([
                TextColumn::make('title')
                    ->label('Название')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('organization.name')
                    ->label('Организация')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true), // Скрыто по умолчанию, т.к. и так в контексте

                TextColumn::make('modules_count')
                    ->label('Модулей')
                    ->counts('modules')
                    ->badge()
                    ->color('gray'),

                TextColumn::make('created_at')
                    ->label('Создан')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            ->filters([
                // Фильтры не обязательны, т.к. выборка уже ограничена организацией
                // Но можно добавить, например, поиск по названию
                Filter::make('title')
                    ->form([
                        TextInput::make('title_search')
                            ->label('Поиск по названию')
                            ->placeholder('Введите название...'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query->when(
                            $data['title_search'],
                            fn (Builder $query, $search) => $query->where('title', 'like', "%{$search}%")
                        );
                    }),
            ])

            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])

            ->bulkActions([
                // Можно добавить массовое удаление, если нужно
            ])

            ->headerActions([
                CreateAction::make()
                    ->label('Создать курс'),
            ]);
    }
}
