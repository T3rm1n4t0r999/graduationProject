<?php

namespace App\Filament\Admin\Resources\Homeworks\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class HomeworksForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('title')
                            ->label('Название домашней работы')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Select::make('task_id')
                            ->label('Задание урока')
                            ->relationship('task', 'title', function ($query) {
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

                        RichEditor::make('description')
                            ->label('Описание')
                            ->nullable()
                            ->columnSpanFull()
                            ->toolbarButtons([
                                'blockquote',
                                'bold',
                                'bulletList',
                                'codeBlock',
                                'h2',
                                'h3',
                                'italic',
                                'link',
                                'orderedList',
                                'redo',
                                'strike',
                                'underline',
                                'undo',
                            ]),
                    ])
                    ->columns(1),

                Section::make('Баллы')
                    ->description('Максимальный балл рассчитывается автоматически на основе суммы баллов всех вопросов')
                    ->schema([
                        TextInput::make('max_score')
                            ->label('Максимальный балл')
                            ->numeric()
                            ->disabled()
                            ->default(0)
                            ->helperText('Сумма баллов всех вопросов домашней работы'),
                    ])
                    ->collapsible()
                    ->collapsed(),

                Section::make('Системные поля')
                    ->schema([
                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),
                    ])
                    ->collapsed(),
            ]);
    }
}
