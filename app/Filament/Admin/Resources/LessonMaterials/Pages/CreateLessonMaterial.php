<?php

namespace App\Filament\Admin\Resources\LessonMaterials\Pages;

use App\Filament\Admin\Resources\LessonMaterials\LessonMaterialResource;
use Filament\Resources\Pages\CreateRecord;

class CreateLessonMaterial extends CreateRecord
{
    protected static string $resource = LessonMaterialResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
