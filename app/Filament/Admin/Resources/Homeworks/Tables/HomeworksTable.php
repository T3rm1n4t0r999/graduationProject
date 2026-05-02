<?php

namespace App\Filament\Admin\Resources\Homeworks\Tables;

use App\Models\Homework;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class HomeworksTable
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

                TextColumn::make('task.title')
                    ->label('Задание урока')
                    ->searchable()
                    ->sortable(),

                BadgeColumn::make('max_score')
                    ->label('Макс. балл')
                    ->numeric()
                    ->sortable()
                    ->color('success'),

                TextColumn::make('questions_count')
                    ->label('Вопросов')
                    ->counts('questions')
                    ->badge()
                    ->color('info'),

                TextColumn::make('created_at')
                    ->label('Дата создания')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Дата обновления')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            ->filters([
                SelectFilter::make('task')
                    ->label('Задание урока')
                    ->relationship('task', 'title', function ($query) {
                        $tenant = \Filament\Facades\Filament::getTenant();
                        if ($tenant) {
                            $query->where('organization_id', $tenant->id);
                        }
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
                    ->label('Добавить домашнюю работу'),
            ]);
    }
}
