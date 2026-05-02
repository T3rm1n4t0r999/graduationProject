<?php

namespace App\Filament\Admin\Resources\StudentProgress\Pages;

use App\Filament\Admin\Resources\StudentProgress\StudentProgressResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditStudentProgress extends EditRecord
{
    protected static string $resource = StudentProgressResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
