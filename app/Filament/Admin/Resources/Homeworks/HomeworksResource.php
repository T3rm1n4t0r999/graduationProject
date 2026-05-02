<?php

namespace App\Filament\Admin\Resources\Homeworks;

use App\Filament\Admin\Resources\Homeworks\Pages\CreateHomeworks;
use App\Filament\Admin\Resources\Homeworks\Pages\EditHomeworks;
use App\Filament\Admin\Resources\Homeworks\Pages\ListHomeworks;
use App\Filament\Admin\Resources\Homeworks\Schemas\HomeworksForm;
use App\Filament\Admin\Resources\Homeworks\Tables\HomeworksTable;
use App\Models\Homework;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class HomeworksResource extends Resource
{
    protected static ?string $model = Homework::class;

    protected static string|null|\BackedEnum $navigationIcon = Heroicon::OutlinedAcademicCap;
    protected static ?string $navigationLabel = 'Домашние работы';
    protected static ?string $modelLabel = 'Домашняя работа';
    protected static ?string $pluralModelLabel = 'Домашние работы';
    protected static string|null|\UnitEnum $navigationGroup = 'Проверочные материалы';

    public static function form(Schema $schema): Schema
    {
        return HomeworksForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return HomeworksTable::configure($table);
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
            'index' => ListHomeworks::route('/'),
            'create' => CreateHomeworks::route('/create'),
            'edit' => EditHomeworks::route('/{record}/edit'),
        ];
    }
}
