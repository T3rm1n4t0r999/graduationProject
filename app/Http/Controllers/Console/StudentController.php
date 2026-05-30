<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Organization;
use App\Models\Course;
use App\Models\Homework;
use App\Models\Exam;
use App\Models\StudentCourse;
use App\Models\StudentHomework;
use App\Models\StudentExam;
use App\Http\Resources\StudentResource;
use App\Http\Resources\OrganizationResource;
use App\Models\StudentProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    // Список студентов организации
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $students = $organization->students()
            ->withCount(['courses', 'homeworks', 'exams'])
            ->with('groups')
            ->get();

        return Inertia::render('Console/Student/List', [
            'organization' => new OrganizationResource($organization),
            'students' => StudentResource::collection($students),
        ]);
    }

    // Просмотр одного студента + его связи
    public function show(Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($student->organization_id === $organization->id, 404);

        $student->load([
            'courses.course',
            'homeworks.homework',
            'exams.exam',
            'groups',
        ]);

        // ID уже назначенных сущностей
        $assignedCourseIds    = $student->courses->pluck('course_id');
        $assignedHomeworkIds  = $student->homeworks->pluck('homework_id');
        $assignedExamIds      = $student->exams->pluck('exam_id');

        // Все возможные для назначения сущности, исключая уже назначенные
        $availableCourses   = $organization->courses()
            ->whereNotIn('id', $assignedCourseIds)
            ->get();

        $availableHomeworks = $organization->homeworks()
            ->whereNotIn('id', $assignedHomeworkIds)
            ->get();

        $availableExams     = $organization->exams()
            ->whereNotIn('id', $assignedExamIds)
            ->get();

        return Inertia::render('Console/Student/Show', [
            'organization'      => new OrganizationResource($organization),
            'student'           => new StudentResource($student),
            'availableCourses'  => $availableCourses,
            'availableHomeworks'=> $availableHomeworks,
            'availableExams'    => $availableExams,
        ]);
    }

    // Назначить курс студенту
    public function assignCourses(Request $request, Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'course_ids'   => 'required|array',
            'course_ids.*' => 'integer|exists:courses,id',
        ]);

        $courseIds = Course::whereIn('id', $validated['course_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        if ($courseIds->isEmpty()) {
            return back()->with('error', 'Нет доступных курсов.');
        }

        // Получаем ID уже назначенных курсов
        $existingCourseIds = $student->courses()->pluck('course_id')->toArray();
        $newCourseIds = $courseIds->diff($existingCourseIds);

        foreach ($newCourseIds as $courseId) {
            $student->courses()->create([
                'course_id'        => $courseId,
                'organization_id'  => $organization->id,
                'granted_by'       => auth()->user()->name ?? 'admin',
                'granted_at'       => now(),
            ]);
        }

        return back()->with('success', 'Курсы назначены.');
    }

    public function assignHomeworks(Request $request, Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'homework_ids'   => 'required|array',
            'homework_ids.*' => 'integer|exists:homeworks,id',
        ]);

        $homeworkIds = Homework::whereIn('id', $validated['homework_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        if ($homeworkIds->isEmpty()) {
            return back()->with('error', 'Нет доступных ДЗ.');
        }

        $existingHomeworkIds = $student->homeworks()->pluck('homework_id')->toArray();
        $newHomeworkIds = $homeworkIds->diff($existingHomeworkIds);

        foreach ($newHomeworkIds as $homeworkId) {
            $student->homeworks()->create([
                'homework_id'      => $homeworkId,
                'organization_id'  => $organization->id,
                'granted_by'       => auth()->user()->name ?? 'admin',
                'granted_at'       => now(),
            ]);
        }

        return back()->with('success', 'Домашние задания назначены.');
    }

    public function assignExams(Request $request, Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'exam_ids'   => 'required|array',
            'exam_ids.*' => 'integer|exists:exams,id',
        ]);

        $examIds = Exam::whereIn('id', $validated['exam_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        if ($examIds->isEmpty()) {
            return back()->with('error', 'Нет доступных контрольных работ.');
        }

        $existingExamIds = $student->exams()->pluck('exam_id')->toArray();
        $newExamIds = $examIds->diff($existingExamIds);

        foreach ($newExamIds as $examId) {
            $student->exams()->create([
                'exam_id'          => $examId,
                'organization_id'  => $organization->id,
                'granted_by'       => auth()->user()->name ?? 'admin',
                'granted_at'       => now(),
            ]);
        }

        return back()->with('success', 'Контрольные работы назначены.');
    }

    // Удаление (batch) — удаляем записи pivot
    public function removeCourses(Request $request, Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:student_courses,id',
        ]);

        StudentCourse::whereIn('id', $validated['ids'])
            ->where('student_id', $student->id)
            ->delete();

        return back()->with('success', 'Выбранные курсы удалены.');
    }

    public function removeHomeworks(Request $request, Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:student_homeworks,id',
        ]);

        StudentHomework::whereIn('id', $validated['ids'])
            ->where('student_id', $student->id)
            ->delete();

        return back()->with('success', 'Выбранные ДЗ удалены.');
    }

    public function removeExams(Request $request, Organization $organization, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:student_exams,id',
        ]);

        StudentExam::whereIn('id', $validated['ids'])
            ->where('student_id', $student->id)
            ->delete();

        return back()->with('success', 'Выбранные контрольные работы удалены.');
    }

    public function progress(Organization $organization, Student $student, Request $request)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($student->organization_id === $organization->id, 404);

        $filters = $request->validate([
            'type'      => 'nullable|string|in:lesson_task,homework,exam',
            'checked'   => 'nullable|boolean',
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
        ]);

        $progressQuery = $student->progresses()->with('progressable');

        if (!empty($filters['type'])) {
            $progressQuery->where('progressable_type', $filters['type']);
        }

        if (isset($filters['checked'])) {
            $progressQuery->where('checked', $filters['checked']);
        }

        if (!empty($filters['date_from'])) {
            $progressQuery->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $progressQuery->whereDate('created_at', '<=', $filters['date_to']);
        }

        $progresses = $progressQuery
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Console/Student/Progress/List', [
            'organization' => new OrganizationResource($organization),
            'student'      => new StudentResource($student),
            'progresses'   => $progresses->through(fn($p) => [
                'id'               => $p->id,
                'progressable_id'  => $p->progressable_id,
                'progressable_type'=> $p->progressable_type,
                'title'            => $p->progressable?->title ?? 'Без названия',
                'points'           => $p->points,
                'max_points'       => $p->max_points,
                'attempt'          => $p->attempt,
                'checked'          => $p->checked,
                'created_at'       => $p->created_at?->format('d.m.Y H:i'),
            ]),
            'filters'      => $filters,
            'availableTypes' => [
                'lesson_task' => 'Задание урока',
                'homework'    => 'Домашнее задание',
                'exam'        => 'Контрольная работа',
            ],
        ]);
    }

    public function progressShow(Organization $organization, Student $student, StudentProgress $progress)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($student->organization_id === $organization->id, 404);
        abort_unless($progress->student_id === $student->id, 404);

        // Жадная загрузка задания и его вопросов
        $progress->load(['progressable.questions' => function ($query) {
            $query->orderBy('order');
        }, 'checkedBy']);

        // Преобразуем answers в коллекцию для быстрого поиска по question_id
        $answers = collect($progress->answers ?? []);

        // Формируем массив вопросов с ответами студента
        $questions = $progress->progressable->questions->map(function ($question) use ($answers) {
            $studentAnswer = $answers->firstWhere('question_id', $question->id);

            return [
                'id'              => $question->id,
                'question'        => $question->question,
                'question_type'   => $question->question_type,
                'options'         => $question->options,
                'correct_answers' => $question->correct_answers,
                'points'          => $question->points,
                'explanation'     => $question->explanation,
                'order'           => $question->order,
                'student_answer'  => $studentAnswer['answer'] ?? null,
            ];
        });

        return Inertia::render('Console/Student/Progress/Show', [
            'organization' => new OrganizationResource($organization),
            'student'      => new StudentResource($student),
            'progress'     => [
                'id'               => $progress->id,
                'title'            => $progress->progressable->title ?? 'Без названия',
                'type'             => $progress->progressable_type, // lesson_task, homework, exam
                'points'           => $progress->points,
                'max_points'       => $progress->max_points,
                'attempt'          => $progress->attempt,
                'checked'          => $progress->checked,
                'checked_by'       => $progress->checkedBy?->name,
                'created_at'       => $progress->created_at?->format('d.m.Y H:i'),
                'attached_files'   => $progress->attached_files ?? [],
                'metadata'         => $progress->metadata ?? [],
            ],
            'questions'    => $questions,
        ]);
    }
}
