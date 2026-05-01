<?php

namespace App\Filament\Admin\Resources\Lessons;

use App\Filament\Admin\Resources\Lessons\Pages\CreateLesson;
use App\Filament\Admin\Resources\Lessons\Pages\EditLesson;
use App\Filament\Admin\Resources\Lessons\Pages\ListLessons;
use App\Models\Lesson;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class LessonResource extends Resource
{
    protected static ?string $model = Lesson::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Learning Materials';

    protected static ?int $navigationSort = 3;

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
                
                Select::make('module_id')
                    ->label('Module')
                    ->relationship('module', 'title')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->live()
                    ->afterStateUpdated(function (callable $set, $state) {
                        // Обновляем organization_id на основе выбранного модуля
                        if ($state) {
                            $module = \App\Models\Module::find($state);
                            if ($module) {
                                $set('organization_id', $module->organization_id);
                            }
                        }
                    }),
                
                Select::make('organization_id')
                    ->label('Organization')
                    ->relationship('organization', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->disabled(fn (callable $get) => $get('module_id') !== null),
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
                
                TextColumn::make('module.title')
                    ->label('Module')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('organization.name')
                    ->label('Organization')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('materials_count')
                    ->label('Materials')
                    ->counts('materials'),
                
                TextColumn::make('tasks_count')
                    ->label('Tasks')
                    ->counts('tasks'),
                
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
            'index' => ListLessons::route('/'),
            'create' => CreateLesson::route('/create'),
            'edit' => EditLesson::route('/{record}/edit'),
        ];
    }
}
