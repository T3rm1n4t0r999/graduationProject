<?php

namespace App\Filament\Admin\Resources\Students;

use App\Filament\Admin\Resources\Students\Pages\CreateStudent;
use App\Filament\Admin\Resources\Students\Pages\EditStudent;
use App\Filament\Admin\Resources\Students\Pages\ListStudents;
use App\Filament\Admin\Resources\Students\Schemas\StudentForm;
use App\Filament\Admin\Resources\Students\Tables\StudentsTable;
use App\Models\Student;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class StudentResource extends Resource
{
    protected static ?string $model = Student::class;
    protected static string|BackedEnum|null $navigationIcon = Heroicon::UserGroup;
    protected static ?string $navigationLabel = 'Студенты';
    protected static ?string $modelLabel = 'Студент';
    protected static ?string $pluralModelLabel = 'Студенты';
    protected static string|null|\UnitEnum $navigationGroup = 'Данные студентов';

    public static function form(Schema $schema): Schema
    {
        return StudentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StudentsTable::configure($table);
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
            'index' => ListStudents::route('/'),
            'create' => CreateStudent::route('/create'),
            'edit' => EditStudent::route('/{record}/edit'),
        ];
    }
}
