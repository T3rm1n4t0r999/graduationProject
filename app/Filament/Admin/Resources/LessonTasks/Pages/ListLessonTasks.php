<?php

namespace App\Filament\Admin\Resources\LessonTasks\Pages;

use App\Filament\Admin\Resources\LessonTasks\LessonTaskResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLessonTasks extends ListRecords
{
    protected static string $resource = LessonTaskResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
