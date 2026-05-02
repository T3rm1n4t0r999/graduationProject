<?php

namespace App\Filament\Admin\Resources\LessonTasks;

use App\Filament\Admin\Resources\LessonTasks\Pages\CreateLessonTask;
use App\Filament\Admin\Resources\LessonTasks\Pages\EditLessonTask;
use App\Filament\Admin\Resources\LessonTasks\Pages\ListLessonTasks;
use App\Filament\Admin\Resources\LessonTasks\Schemas\LessonTaskForm;
use App\Filament\Admin\Resources\LessonTasks\Tables\LessonTasksTable;
use App\Models\LessonTask;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LessonTaskResource extends Resource
{
    protected static ?string $model = LessonTask::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedAcademicCap;

    protected static ?string $navigationLabel = 'Практические задания';
    protected static ?string $modelLabel = 'Практическое задание';
    protected static ?string $pluralModelLabel = 'Практическое задание';
    protected static string|null|\UnitEnum $navigationGroup = 'Обучающие материалы';

    public static function form(Schema $schema): Schema
    {
        return LessonTaskForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LessonTasksTable::configure($table);
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
