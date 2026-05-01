<?php

namespace App\Filament\Admin\Resources\LessonTasks;

use App\Filament\Admin\Resources\LessonTasks\Pages\CreateLessonTask;
use App\Filament\Admin\Resources\LessonTasks\Pages\EditLessonTask;
use App\Filament\Admin\Resources\LessonTasks\Pages\ListLessonTasks;
use App\Models\LessonTask;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class LessonTaskResource extends Resource
{
    protected static ?string $model = LessonTask::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static ?string $navigationGroup = 'Learning Materials';

    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('title')
                    ->label('Title')
                    ->required()
                    ->maxLength(255),
                
                Textarea::make('description')
                    ->label('Description')
                    ->rows(3)
                    ->columnSpanFull(),
                
                TextInput::make('max_score')
                    ->label('Max Score')
                    ->numeric()
                    ->default(0)
                    ->minValue(0),
                
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
                
                Repeater::make('questions')
                    ->label('Questions')
                    ->relationship('questions')
                    ->schema([
                        TextInput::make('question_text')
                            ->label('Question')
                            ->required()
                            ->maxLength(500),
                        
                        TextInput::make('correct_answer')
                            ->label('Correct Answer')
                            ->required()
                            ->maxLength(255),
                        
                        TextInput::make('score')
                            ->label('Score')
                            ->numeric()
                            ->default(1)
                            ->minValue(0),
                    ])
                    ->columns(1)
                    ->columnSpanFull(),
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
                
                TextColumn::make('max_score')
                    ->label('Max Score')
                    ->sortable(),
                
                TextColumn::make('lesson.title')
                    ->label('Lesson')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('organization.name')
                    ->label('Organization')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('questions_count')
                    ->label('Questions')
                    ->counts('questions'),
                
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
            'index' => ListLessonTasks::route('/'),
            'create' => CreateLessonTask::route('/create'),
            'edit' => EditLessonTask::route('/{record}/edit'),
        ];
    }
}
