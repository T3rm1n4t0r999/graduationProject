<?php

namespace App\Filament\Admin\Resources\Homeworks\Pages;

use App\Filament\Admin\Resources\Homeworks\HomeworksResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditHomeworks extends EditRecord
{
    protected static string $resource = HomeworksResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
