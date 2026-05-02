<?php

namespace App\Filament\Admin\Resources\StudentProgress\Pages;

use App\Filament\Admin\Resources\StudentProgress\StudentProgressResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStudentProgress extends ListRecords
{
    protected static string $resource = StudentProgressResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
