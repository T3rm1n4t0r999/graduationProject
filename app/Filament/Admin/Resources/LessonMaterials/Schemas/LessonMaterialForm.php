<?php

namespace App\Filament\Admin\Resources\LessonMaterials\Schemas;

use App\Models\LessonMaterial;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class LessonMaterialForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('title')
                            ->label('Название материала')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Select::make('material_type')
                            ->label('Тип материала')
                            ->options([
                                'theory' => 'Теория',
                                'example' => 'Пример',
                                'reference' => 'Справочник',
                                'video_lesson' => 'Видеоурок',
                                'article' => 'Статья',
                            ])
                            ->default('theory')
                            ->required()
                            ->native(false),

                        Select::make('lesson_id')
                            ->label('Урок')
                            ->relationship('lesson', 'title', function ($query) {
                                $tenant = \Filament\Facades\Filament::getTenant();
                                if ($tenant) {
                                    $query->where('organization_id', $tenant->id);
                                }
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->native(false),

                        Textarea::make('content')
                            ->label('Содержание')
                            ->nullable()
                            ->columnSpanFull(),
                    ])
                    ->columns(1),

                Section::make('Файлы')
                    ->description('Прикрепите файлы к материалу (PDF, изображения, видео и т.д.)')
                    ->schema([
                        FileUpload::make('files')
                            ->label('Файлы')
                            ->multiple()
                            ->directory('lesson-materials')
                            ->visibility('public')
                            ->preserveFilenames()
                            ->maxSize(1024 * 50) // 50 MB
                            ->acceptedFileTypes([
                                'application/pdf',
                                'image/*',
                                'video/*',
                                'audio/*',
                                'text/plain',
                                'application/msword',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            ]),
                    ])
                    ->collapsible(),

                Section::make('Системные поля')
                    ->schema([
                        Hidden::make('organization_id')
                            ->default(fn () => \Filament\Facades\Filament::getTenant()?->id),

                        TextInput::make('order')
                            ->label('Порядок отображения')
                            ->numeric()
                            ->default(0)
                            ->minValue(0),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }
}
