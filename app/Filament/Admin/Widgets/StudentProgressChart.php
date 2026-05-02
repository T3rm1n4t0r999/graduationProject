<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Student;
use App\Models\StudentProgress;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class StudentProgressChart extends ChartWidget
{
    public ?string $heading = 'Прогресс студентов по заданиям';

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $organization = filament()->getTenant();

        if (!$organization) {
            return ['labels' => [], 'datasets' => []];
        }

        // Получаем данные о прогрессе студентов с группировкой по диапазонам выполнения
        $progressData = StudentProgress::where('organization_id', $organization->id)
            ->selectRaw('student_id, SUM(points) as total_points, SUM(max_points) as total_max_points')
            ->groupBy('student_id')
            ->get();

        // Категории для гистограммы
        $categories = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
        $counts = [0, 0, 0, 0, 0];

        foreach ($progressData as $data) {
            if ($data->total_max_points > 0) {
                $percentage = ($data->total_points / $data->total_max_points) * 100;

                if ($percentage <= 20) {
                    $counts[0]++;
                } elseif ($percentage <= 40) {
                    $counts[1]++;
                } elseif ($percentage <= 60) {
                    $counts[2]++;
                } elseif ($percentage <= 80) {
                    $counts[3]++;
                } else {
                    $counts[4]++;
                }
            }
        }

        return [
            'datasets' => [
                [
                    'label' => 'Количество студентов',
                    'backgroundColor' => [
                        '#ef4444', // 0-20% - красный
                        '#f97316', // 21-40% - оранжевый
                        '#eab308', // 41-60% - желтый
                        '#84cc16', // 61-80% - светло-зеленый
                        '#22c55e', // 81-100% - зеленый
                    ],
                    'data' => $counts,
                ],
            ],
            'labels' => $categories,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'stepSize' => 1,
                    ],
                ],
            ],
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
            ],
        ];
    }
}
