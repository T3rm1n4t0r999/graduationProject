<?php

namespace App\Http\Controllers\Console;


use App\Models\Organization;
use Inertia\Inertia;

class ConsoleController
{
    public function index(Organization $organization){
        return Inertia::render('Console/Index', [
            'organization' => $organization
        ]);
    }
}
