<?php

namespace App\Filament\Admin\Resources\Courses\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CourseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('title')
                            ->label('Название курса')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        TextInput::make('description')
                            ->label('Описание')
                            ->nullable()
                            ->columnSpanFull(),

                        // Автоматически подставляем организацию и скрываем поле
                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),
                    ])
                    ->columns(1),
            ]);
    }
}
