<?php

namespace App\Filament\Admin\Resources\Modules\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ModuleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('title')
                            ->label('Название модуля')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Select::make('course_id')
                            ->label('Курс')
                            ->relationship('course', 'title', function ($query) {
                                $tenant = \Filament\Facades\Filament::getTenant();
                                if ($tenant) {
                                    $query->where('organization_id', $tenant->id);
                                }
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->native(false),

                        RichEditor::make('description')
                            ->label('Описание')
                            ->nullable()
                            ->columnSpanFull(),
                    ])
                    ->columns(1),

                Section::make('Системные поля')
                    ->schema([
                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),
                    ])
                    ->collapsed(),
            ]);
    }
}
