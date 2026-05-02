<?php

namespace App\Filament\Admin\Resources\Homeworks\Pages;

use App\Filament\Admin\Resources\Homeworks\HomeworksResource;
use Filament\Resources\Pages\CreateRecord;

class CreateHomeworks extends CreateRecord
{
    protected static string $resource = HomeworksResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
