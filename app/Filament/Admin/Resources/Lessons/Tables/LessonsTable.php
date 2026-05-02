<?php

namespace App\Filament\Admin\Resources\Lessons\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class LessonsTable
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
                TextColumn::make('title')
                    ->label('Название')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('module.title')
                    ->label('Модуль')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('module.course.title')
                    ->label('Курс')
                    ->sortable(),

                TextColumn::make('materials_count')
                    ->label('Материалов')
                    ->counts('materials')
                    ->badge()
                    ->color('info'),

                TextColumn::make('tasks_count')
                    ->label('Заданий')
                    ->counts('tasks')
                    ->badge()
                    ->color('warning'),

                TextColumn::make('created_at')
                    ->label('Создан')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            ->filters([
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

            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])

            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
                CreateAction::make()
                    ->label('Создать урок'),
            ]);
    }
}
