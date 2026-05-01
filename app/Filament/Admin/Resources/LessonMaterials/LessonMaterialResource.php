<?php

namespace App\Filament\Admin\Resources\LessonMaterials;

use App\Filament\Admin\Resources\LessonMaterials\Pages\CreateLessonMaterial;
use App\Filament\Admin\Resources\LessonMaterials\Pages\EditLessonMaterial;
use App\Filament\Admin\Resources\LessonMaterials\Pages\ListLessonMaterials;
use App\Models\LessonMaterial;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class LessonMaterialResource extends Resource
{
    protected static ?string $model = LessonMaterial::class;

    protected static ?string $navigationIcon = 'heroicon-o-document';

    protected static ?string $navigationGroup = 'Learning Materials';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('title')
                    ->label('Title')
                    ->required()
                    ->maxLength(255),
                
                RichEditor::make('content')
                    ->label('Content')
                    ->columnSpanFull(),
                
                Select::make('material_type')
                    ->label('Material Type')
                    ->options([
                        'theory' => 'Theory',
                        'example' => 'Example',
                        'reference' => 'Reference',
                        'video_lesson' => 'Video Lesson',
                        'article' => 'Article',
                    ])
                    ->default('theory')
                    ->required(),
                
                TextInput::make('order')
                    ->label('Order')
                    ->numeric()
                    ->default(0),
                
                Select::make('lesson_id')
                    ->label('Lesson')
                    ->relationship('lesson', 'title')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->live()
                    ->afterStateUpdated(function (callable $set, $state) {
                        // Обновляем organization_id на основе выбранного урока
                        if ($state) {
                            $lesson = \App\Models\Lesson::find($state);
                            if ($lesson) {
                                $set('organization_id', $lesson->organization_id);
                            }
                        }
                    }),
                
                Select::make('organization_id')
                    ->label('Organization')
                    ->relationship('organization', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->disabled(fn (callable $get) => $get('lesson_id') !== null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                
                TextColumn::make('title')
                    ->label('Title')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('material_type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'theory' => 'Theory',
                        'example' => 'Example',
                        'reference' => 'Reference',
                        'video_lesson' => 'Video Lesson',
                        'article' => 'Article',
                        default => $state,
                    }),
                
                TextColumn::make('order')
                    ->label('Order')
                    ->sortable(),
                
                TextColumn::make('lesson.title')
                    ->label('Lesson')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('organization.name')
                    ->label('Organization')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                //
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLessonMaterials::route('/'),
            'create' => CreateLessonMaterial::route('/create'),
            'edit' => EditLessonMaterial::route('/{record}/edit'),
        ];
    }
}
