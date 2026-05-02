<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Student;
use App\Models\StudentProgress;
use App\Models\LessonTask;
use App\Models\Homework;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $organization = filament()->getTenant();

        if (!$organization) {
            return [];
        }

        // Общее количество студентов в организации
        $totalStudents = Student::where('organization_id', $organization->id)->count();

        // Количество активных студентов (тех, у кого есть прогресс)
        $activeStudents = StudentProgress::where('organization_id', $organization->id)
            ->distinct('student_id')
            ->count('student_id');

        // Всего заданий (LessonTask + Homework)
        $totalTasks = LessonTask::where('organization_id', $organization->id)->count()
            + Homework::where('organization_id', $organization->id)->count();

        // Средний балл всех студентов
        $averageScore = StudentProgress::where('organization_id', $organization->id)
            ->selectRaw('SUM(points) as total_points, SUM(max_points) as total_max_points')
            ->first();

        $averagePercentage = 0;
        if ($averageScore && $averageScore->total_max_points > 0) {
            $averagePercentage = round(($averageScore->total_points / $averageScore->total_max_points) * 100, 1);
        }

        return [
            Stat::make('Всего студентов', $totalStudents)
                ->description('Общее количество студентов в организации')
                ->icon('heroicon-o-users')
                ->color('primary'),

            Stat::make('Активных студентов', $activeStudents)
                ->description('Студентов, выполнивших хотя бы одно задание')
                ->icon('heroicon-o-user-circle')
                ->color('success'),

            Stat::make('Всего заданий', $totalTasks)
                ->description('Учебных и домашних заданий')
                ->icon('heroicon-o-document-text')
                ->color('warning'),

            Stat::make('Средний прогресс', $averagePercentage . '%')
                ->description('Средний процент выполнения заданий')
                ->icon('heroicon-o-chart-bar')
                ->color($averagePercentage >= 70 ? 'success' : ($averagePercentage >= 40 ? 'warning' : 'danger')),
        ];
    }
}
