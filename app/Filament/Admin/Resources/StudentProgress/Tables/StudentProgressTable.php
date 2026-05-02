<?php

namespace App\Filament\Admin\Resources\StudentProgress\Tables;

use App\Models\StudentProgress as StudentProgressModel;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Table;
use Filament\Forms\Components\TextInput;
use Illuminate\Database\Eloquent\Builder;

class StudentProgressTable
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
                TextColumn::make('student.firstname')
                    ->label('Студент')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('progressable_type')
                    ->label('Тип')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'App\\Models\\Homework' => 'Домашнее задание',
                        'App\\Models\\LessonTask' => 'Задание урока',
                        default => $state,
                    })
                    ->badge()
                    ->color('info'),

                TextColumn::make('points')
                    ->label('Баллы')
                    ->numeric()
                    ->sortable()
                    ->badge()
                    ->color(fn (int $state, $record): string => match (true) {
                        $record->max_points > 0 && $state >= $record->max_points => 'success',
                        $record->max_points > 0 && $state >= ($record->max_points / 2) => 'warning',
                        default => 'danger',
                    }),

                TextColumn::make('max_points')
                    ->label('Макс. баллы')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('attempt')
                    ->label('Попытка')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Дата выполнения')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false),
            ])
            ->filters([
                // ✅ ИСПОЛЬЗУЕМ SelectFilter вместо Select::make()
                SelectFilter::make('student_id')
                    ->label('Студент')
                    ->relationship('student', 'firstname') // Автоматическая загрузка студентов через связь
                    ->searchable()
                    ->preload(), // Опционально: загружать варианты сразу, а не при вводе

                Filter::make('points')
                    ->form([
                        TextInput::make('min_points')
                            ->label('Мин. баллы')
                            ->numeric(),
                        TextInput::make('max_points_filter')
                            ->label('Макс. баллы')
                            ->numeric(),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['min_points'],
                                fn (Builder $query, $min) => $query->where('points', '>=', $min)
                            )
                            ->when(
                                $data['max_points_filter'],
                                fn (Builder $query, $max) => $query->where('points', '<=', $max)
                            );
                    }),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                // Массовые действия при необходимости
            ]);
    }
}
