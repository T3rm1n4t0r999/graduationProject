<?php

namespace App\Filament\Admin\Resources\Students\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StudentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('telegram_id')
                            ->label('Telegram ID')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),

                        TextInput::make('username')
                            ->label('Имя пользователя')
                            ->nullable()
                            ->maxLength(255),

                        TextInput::make('firstname')
                            ->label('Имя')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('lastname')
                            ->label('Фамилия')
                            ->nullable()
                            ->maxLength(255),

                        Select::make('role')
                            ->label('Роль')
                            ->options([
                                'guest' => 'Гость',
                                'student' => 'Студент',
                                'premium' => 'Премиум',
                            ])
                            ->default('student')
                            ->required()
                            ->native(false),

                        TextInput::make('score')
                            ->label('Баллы')
                            ->numeric()
                            ->default(0)
                            ->minValue(0),

                        TextInput::make('rank')
                            ->label('Ранг')
                            ->default('Новичок')
                            ->maxLength(255),
                    ])
                    ->columns(2),

                Section::make('Системные поля')
                    ->schema([
                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),
                    ])
                    ->collapsed(),
            ]);
    }
}
