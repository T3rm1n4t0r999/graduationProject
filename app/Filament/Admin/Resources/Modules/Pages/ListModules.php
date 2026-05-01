<?php

namespace App\Filament\Admin\Resources\Modules\Pages;

use App\Filament\Admin\Resources\Modules\ModuleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListModules extends ListRecords
{
    protected static string $resource = ModuleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
