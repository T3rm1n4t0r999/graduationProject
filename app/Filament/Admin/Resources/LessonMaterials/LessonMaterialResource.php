<?php

namespace App\Filament\Admin\Resources\LessonMaterials;

use App\Filament\Admin\Resources\LessonMaterials\Pages\CreateLessonMaterial;
use App\Filament\Admin\Resources\LessonMaterials\Pages\EditLessonMaterial;
use App\Filament\Admin\Resources\LessonMaterials\Pages\ListLessonMaterials;
use App\Filament\Admin\Resources\LessonMaterials\Schemas\LessonMaterialForm;
use App\Filament\Admin\Resources\LessonMaterials\Tables\LessonMaterialsTable;
use App\Models\LessonMaterial;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LessonMaterialResource extends Resource
{
    protected static ?string $model = LessonMaterial::class;

    protected static string|null|\BackedEnum $navigationIcon = Heroicon::OutlinedAcademicCap;
    protected static ?string $navigationLabel = 'Теоретические задания';
    protected static ?string $modelLabel = 'Теоретическое задание';
    protected static ?string $pluralModelLabel = 'Теоретические задания';
    protected static string|null|\UnitEnum $navigationGroup = 'Обучающие материалы';

    public static function form(Schema $schema): Schema
    {
        return LessonMaterialForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LessonMaterialsTable::configure($table);
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
