<?php

namespace App\Filament\Admin\Resources\Questions\Tables;

use App\Models\Question;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class QuestionsTable
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
                TextColumn::make('question')
                    ->label('Вопрос')
                    ->searchable()
                    ->limit(50),

                BadgeColumn::make('question_type')
                    ->label('Тип')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'single_choice' => 'Один ответ',
                        'multiple_choice' => 'Несколько ответов',
                        'text_input' => 'Текстовый',
                        default => $state,
                    })
                    ->colors([
                        'primary' => 'single_choice',
                        'success' => 'multiple_choice',
                        'warning' => 'text_input',
                    ]),

                BadgeColumn::make('points')
                    ->label('Баллы')
                    ->numeric()
                    ->sortable()
                    ->color('info'),

                TextColumn::make('questionable.title')
                    ->label('Задание')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('order')
                    ->label('Порядок')
                    ->numeric()
                    ->sortable(),

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
                SelectFilter::make('question_type')
                    ->label('Тип вопроса')
                    ->options([
                        'single_choice' => 'Один правильный ответ',
                        'multiple_choice' => 'Несколько правильных ответов',
                        'text_input' => 'Текстовый ответ',
                    ]),

                SelectFilter::make('questionable')
                    ->label('Задание')
                    ->relationship('questionable', 'title', function ($query) {
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
                    ->label('Добавить вопрос'),
            ]);
    }
}
