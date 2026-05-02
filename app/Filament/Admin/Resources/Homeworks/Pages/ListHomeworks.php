<?php

namespace App\Filament\Admin\Resources\Homeworks\Pages;

use App\Filament\Admin\Resources\Homeworks\HomeworksResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;

class ListHomeworks extends ListRecords
{
    protected static string $resource = HomeworksResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //
        ];
    }
}
