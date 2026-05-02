<?php

namespace App\Filament\Admin\Resources\StudentProgress\Pages;

use App\Filament\Admin\Resources\StudentProgress\StudentProgressResource;
use Filament\Resources\Pages\CreateRecord;

class CreateStudentProgress extends CreateRecord
{
    protected static string $resource = StudentProgressResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
