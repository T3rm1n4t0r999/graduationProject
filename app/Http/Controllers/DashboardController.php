<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Client\Request;
use Inertia\Inertia;

class DashboardController
{
// App/Http/Controllers/DashboardController.php
    public function index(Request $request)
    {
        $user = $request->user();

        // Организации пользователя
        $organizations = $user->organizations()
            ->with(['bot', 'users' => function ($q) {
                $q->select('id'); // только для подсчёта
            }])
            ->withPivot('role')
            ->get();
        $students = Student::where('organization_id', $user->$organizations->first()->id)->get();
        // Статистика (только если есть доступ)
        $stats = null;
        if ($organizations->isNotEmpty()) {
            $org = $organizations->first();
            $stats = [
                'totalStudents' => $students->count(),
                'activeBots' => $org->bot?->is_active ? 1 : 0,
                'completedLessons' => 42, // 🔹 заменить на реальный запрос
                'averageProgress' => 68,  // 🔹 заменить на реальный запрос
                'studentsGrowth' => 12,   // 🔹 заменить на реальный запрос
            ];
        }

        return Inertia::render('Dashboard', [
            'organizations' => $organizations,
            'stats' => $stats,
        ]);
    }

}
