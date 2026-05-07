<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController
{
// App/Http/Controllers/DashboardController.php
    public function index(Request $request)
    {
        $user = $request->user();

        // Организации пользователя
        $organizations = $user->organizations()
            ->with(['bot'])
            ->withCount('users')
            ->withPivot('role')
            ->get();

        // Статистика для первой организации (если есть доступ)
        $stats = null;
        if ($organizations->isNotEmpty()) {
            $org = $organizations->first();
            $students = Student::where('organization_id', $org->id)->get();

            $stats = [
                'totalStudents'    => $students->count(),
                'activeBots'       => $org->bot?->is_active ? 1 : 0,
                'completedLessons' => 42, // замените на реальный запрос
                'averageProgress'  => 68, // замените на реальный запрос
                'studentsGrowth'   => 12, // замените на реальный запрос
            ];
        }

        return Inertia::render('Dashboard', [
            'organizations' => $organizations,
            'stats'         => $stats,
        ]);
    }

}
