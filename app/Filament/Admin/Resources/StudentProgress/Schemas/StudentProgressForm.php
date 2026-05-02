<?php

namespace App\Filament\Admin\Resources\StudentProgress\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StudentProgressForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        Select::make('student_id')
                            ->label('Студент')
                            ->relationship('student', 'firstname', function ($query) {
                                $tenant = \Filament\Facades\Filament::getTenant();
                                if ($tenant) {
                                    $query->where('organization_id', $tenant->id);
                                }
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->native(false),

                        TextInput::make('points')
                            ->label('Полученные баллы')
                            ->numeric()
                            ->default(0)
                            ->minValue(0),

                        TextInput::make('max_points')
                            ->label('Максимальные баллы')
                            ->numeric()
                            ->default(0)
                            ->minValue(0),

                        TextInput::make('attempt')
                            ->label('Попытка')
                            ->numeric()
                            ->default(1)
                            ->minValue(1)
                            ->disabled(),
                    ])
                    ->columns(2),

                Section::make('Данные прогресса')
                    ->schema([
                        Textarea::make('answers')
                            ->label('Ответы (JSON)')
                            ->nullable()
                            ->rows(5)
                            ->hint('Формат JSON'),

                        KeyValue::make('metadata')
                            ->label('Метаданные')
                            ->keyLabel('Ключ')
                            ->valueLabel('Значение')
                            ->nullable()
                            ->addColumnKeys()
                            ->addColumnsValues(),
                    ])
                    ->columns(1),

                Section::make('Системные поля')
                    ->schema([
                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),

                        Hidden::make('progressable_id'),

                        Hidden::make('progressable_type'),
                    ])
                    ->collapsed(),
            ]);
    }
}
