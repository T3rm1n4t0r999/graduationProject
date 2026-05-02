<?php

namespace App\Filament\Admin\Resources\LessonTasks\Pages;

use App\Filament\Admin\Resources\LessonTasks\LessonTaskResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;

class ListLessonTasks extends ListRecords
{
    protected static string $resource = LessonTaskResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('create')
                ->label('Добавить задание')
                ->url(static::getResource()::getUrl('create')),
        ];
    }
}
