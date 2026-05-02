<?php

namespace App\Filament\Admin\Resources\Questions\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class QuestionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        Select::make('questionable_type')
                            ->label('Тип задания')
                            ->options([
                                'App\Models\LessonTask' => 'Задание урока',
                            ])
                            ->default('App\Models\LessonTask')
                            ->disabled()
                            ->native(false),

                        Select::make('questionable_id')
                            ->label('Задание')
                            ->relationship('questionable', 'title', function ($query) {
                                $tenant = \Filament\Facades\Filament::getTenant();
                                if ($tenant) {
                                    $query->where('organization_id', $tenant->id);
                                }
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->native(false)
                            ->columnSpanFull(),

                        Textarea::make('question')
                            ->label('Текст вопроса')
                            ->required()
                            ->rows(3)
                            ->columnSpanFull(),

                        Select::make('question_type')
                            ->label('Тип вопроса')
                            ->options([
                                'single_choice' => 'Один правильный ответ',
                                'multiple_choice' => 'Несколько правильных ответов',
                                'text_input' => 'Текстовый ответ',
                            ])
                            ->default('single_choice')
                            ->required()
                            ->native(false)
                            ->live(),

                        TextInput::make('points')
                            ->label('Баллы за вопрос')
                            ->numeric()
                            ->default(1)
                            ->minValue(0)
                            ->helperText('Этот балл будет добавлен к максимальному баллу задания'),

                        TextInput::make('order')
                            ->label('Порядок отображения')
                            ->numeric()
                            ->default(0)
                            ->minValue(0),
                    ])
                    ->columns(2),

                Section::make('Варианты ответов')
                    ->description('Заполните варианты ответов для вопросов с выбором')
                    ->schema([
                        Repeater::make('options')
                            ->label('Варианты ответов')
                            ->schema([
                                TextInput::make('option')
                                    ->label('Вариант')
                                    ->required()
                                    ->maxLength(500),
                            ])
                            ->columns(1)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['option'] ?? null)
                            ->reorderable()
                            ->reorderableWithDragAndDrop()
                            ->addActionLabel('Добавить вариант'),

                        Repeater::make('correct_answers')
                            ->label('Правильные ответы')
                            ->schema([
                                TextInput::make('answer')
                                    ->label('Правильный ответ')
                                    ->required()
                                    ->maxLength(500),
                            ])
                            ->columns(1)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['answer'] ?? null)
                            ->reorderable()
                            ->reorderableWithDragAndDrop()
                            ->addActionLabel('Добавить правильный ответ')
                            ->visible(fn (callable $get) => in_array($get('question_type'), ['multiple_choice', 'single_choice'])),
                    ])
                    ->collapsible()
                    ->collapsed(),

                Section::make('Дополнительно')
                    ->schema([
                        Textarea::make('explanation')
                            ->label('Объяснение ответа')
                            ->nullable()
                            ->rows(3)
                            ->columnSpanFull()
                            ->helperText('Пояснение, которое показывается после ответа'),

                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),

                        Hidden::make('metadata')
                            ->default([]),
                    ])
                    ->columns(1)
                    ->collapsed(),
            ]);
    }
}
