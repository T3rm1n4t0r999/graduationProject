<?php

namespace App\Filament\Admin\Resources\LessonMaterials\Pages;

use App\Filament\Admin\Resources\LessonMaterials\LessonMaterialResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLessonMaterial extends EditRecord
{
    protected static string $resource = LessonMaterialResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
