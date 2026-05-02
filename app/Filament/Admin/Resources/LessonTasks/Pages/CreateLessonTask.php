<?php

namespace App\Filament\Admin\Resources\LessonTasks\Pages;

use App\Filament\Admin\Resources\LessonTasks\LessonTaskResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\CreateRecord;

class CreateLessonTask extends CreateRecord
{
    protected static string $resource = LessonTaskResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
