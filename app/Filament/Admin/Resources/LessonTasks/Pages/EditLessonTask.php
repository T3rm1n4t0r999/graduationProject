<?php

namespace App\Filament\Admin\Resources\LessonTasks\Pages;

use App\Filament\Admin\Resources\LessonTasks\LessonTaskResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditLessonTask extends EditRecord
{
    protected static string $resource = LessonTaskResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
