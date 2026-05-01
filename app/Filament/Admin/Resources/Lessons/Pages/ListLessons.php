<?php

namespace App\Filament\Admin\Resources\Lessons\Pages;

use App\Filament\Admin\Resources\Lessons\LessonResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLessons extends ListRecords
{
    protected static string $resource = LessonResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
