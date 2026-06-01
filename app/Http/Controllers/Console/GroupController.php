<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\GroupResource;
use App\Http\Resources\StudentResource;
use App\Http\Resources\CourseResource;
use App\Http\Resources\HomeworkResource;
use App\Http\Resources\ExamResource;
use App\Models\Organization;
use App\Models\Group;
use App\Models\Student;
use App\Models\Course;
use App\Models\Homework;
use App\Models\Exam;
use App\Models\GroupCourse;
use App\Models\GroupHomework;
use App\Models\GroupExam;
use App\Models\StudentCourse;
use App\Models\StudentHomework;
use App\Models\StudentExam;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GroupController extends Controller
{
    // Список групп
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        // ✅ Пагинация вместо get() + select() для экономии памяти
        $groups = $organization->groups()
            ->select(['id', 'name', 'description', 'specialty', 'code', 'organization_id'])
            ->withCount('students')
            ->paginate(20);

        return Inertia::render('Console/Group/List', [
            'organization' => new OrganizationResource($organization),
            'groups' => GroupResource::collection($groups),
        ]);
    }

    public function store(Request $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'specialty' => 'nullable|string|max:255',
            'code' => ['nullable', 'string', 'max:5', Rule::unique('groups', 'code')->where('organization_id', $organization->id)],
        ]);

        if (empty($validated['code'])) {
            // ✅ Генерируем более длинный код, чтобы избежать коллизий и Race Condition
            $validated['code'] = strtoupper(Str::random(5));
        }

        $validated['organization_id'] = $organization->id;

        try {
            Group::create($validated);
        } catch (\Illuminate\Database\QueryException $e) {
            // ✅ Ловим Unique Violation, если race condition все же произошел
            return back()->with('error', 'Произошла ошибка при генерации кода группы. Попробуйте еще раз.');
        }

        return back()->with('success', 'Группа создана');
    }

    public function show(Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $group->load(['students', 'courses.course', 'homeworks.homework', 'exams.exam']);

        // ✅ 1 SQL-запрос (NOT EXISTS) вместо загрузки массивов ID в PHP
        $availableCourses = $organization->courses()
            ->whereDoesntHave('groups', fn($q) => $q->where('groups.id', $group->id))
            ->select(['id', 'title', 'organization_id'])
            ->get();

        $availableHomeworks = $organization->homeworks()
            ->whereDoesntHave('groups', fn($q) => $q->where('groups.id', $group->id))
            ->select(['id', 'title', 'organization_id'])
            ->get();

        $availableExams = $organization->exams()
            ->whereDoesntHave('groups', fn($q) => $q->where('groups.id', $group->id))
            ->select(['id', 'title', 'organization_id'])
            ->get();

        $availableStudents = $organization->students()
            ->whereDoesntHave('groups', fn($q) => $q->where('groups.id', $group->id))
            ->select(['id', 'firstname', 'lastname', 'username', 'telegram_id'])
            ->get();

        return Inertia::render('Console/Group/Show', [
            'organization'       => new OrganizationResource($organization),
            'group'              => new GroupResource($group),
            'availableStudents'  => StudentResource::collection($availableStudents),
            'availableCourses'   => CourseResource::collection($availableCourses),
            'availableHomeworks' => HomeworkResource::collection($availableHomeworks),
            'availableExams'     => ExamResource::collection($availableExams),
        ]);
    }

    public function update(Request $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'specialty' => 'nullable|string|max:255',
        ]);
        $group->update($validated);
        return back()->with('success', 'Группа обновлена');
    }

    public function destroy(Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);
        $group->delete();
        return redirect()->route('group.index', $organization)->with('success', 'Группа удалена');
    }

    // Добавление студентов в группу (массовое)
    public function addStudents(Request $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'integer|exists:students,id',
        ]);

        $studentIds = Student::whereIn('id', $validated['student_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        if ($studentIds->isEmpty()) {
            return back()->with('error', 'Студенты не найдены.');
        }

        // ✅ 1 запрос: Массовое прикрепление к группе
        $group->students()->syncWithoutDetaching($studentIds);

        $now = now();
        $organizationId = $organization->id;

        // ✅ Массовое назначение курсов (1 запрос вместо N*M)
        $courseIds = $group->courses()->pluck('course_id');
        if ($courseIds->isNotEmpty()) {
            $courseData = [];
            foreach ($studentIds as $studentId) {
                foreach ($courseIds as $courseId) {
                    $courseData[] = [
                        'student_id' => $studentId, 'course_id' => $courseId,
                        'organization_id' => $organizationId, 'granted_by' => 'group', 'granted_at' => $now,
                    ];
                }
            }
            StudentCourse::upsert($courseData, ['student_id', 'course_id'], ['granted_by', 'granted_at']);
        }

        // ✅ Массовое назначение ДЗ (1 запрос)
        $homeworkIds = $group->homeworks()->pluck('homework_id');
        if ($homeworkIds->isNotEmpty()) {
            $hwData = [];
            foreach ($studentIds as $studentId) {
                foreach ($homeworkIds as $hwId) {
                    $hwData[] = [
                        'student_id' => $studentId, 'homework_id' => $hwId,
                        'organization_id' => $organizationId, 'granted_by' => 'group', 'granted_at' => $now,
                    ];
                }
            }
            StudentHomework::upsert($hwData, ['student_id', 'homework_id'], ['granted_by', 'granted_at']);
        }

        // ✅ Массовое назначение Экзаменов (1 запрос)
        $examIds = $group->exams()->pluck('exam_id');
        if ($examIds->isNotEmpty()) {
            $examData = [];
            foreach ($studentIds as $studentId) {
                foreach ($examIds as $examId) {
                    $examData[] = [
                        'student_id' => $studentId, 'exam_id' => $examId,
                        'organization_id' => $organizationId, 'granted_by' => 'group', 'granted_at' => $now,
                    ];
                }
            }
            StudentExam::upsert($examData, ['student_id', 'exam_id'], ['granted_by', 'granted_at']);
        }

        return back()->with('success', 'Студенты добавлены и назначения выданы.');
    }

    // Удаление студента из группы
    public function removeStudent(Organization $organization, Group $group, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);
        abort_unless($student->organization_id === $organization->id, 404);

        $group->students()->detach($student->id);

        // ✅ Массовое удаление унаследованных назначений (3 запроса вместо N*3)
        $courseIds = $group->courses()->pluck('course_id');
        if ($courseIds->isNotEmpty()) {
            StudentCourse::where('student_id', $student->id)->whereIn('course_id', $courseIds)->delete();
        }

        $hwIds = $group->homeworks()->pluck('homework_id');
        if ($hwIds->isNotEmpty()) {
            StudentHomework::where('student_id', $student->id)->whereIn('homework_id', $hwIds)->delete();
        }

        $examIds = $group->exams()->pluck('exam_id');
        if ($examIds->isNotEmpty()) {
            StudentExam::where('student_id', $student->id)->whereIn('exam_id', $examIds)->delete();
        }

        return back()->with('success', 'Студент удалён из группы');
    }


    // Назначение курса группе
    public function assignCourse(Request $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $validated = $request->validate([
            'course_ids'   => 'required|array',
            'course_ids.*' => 'integer|exists:courses,id',
        ]);

        $courseIds = Course::whereIn('id', $validated['course_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        // ✅ Массовое создание GroupCourse (1 запрос)
        // Хук created в модели GroupCourse автоматически раздаст курсы студентам через upsert
        $data = $courseIds->map(fn($courseId) => [
            'group_id'   => $group->id,
            'course_id'  => $courseId,
            'granted_by' => auth()->user()->name ?? 'admin',
            'granted_at' => now(),
        ])->toArray();

        GroupCourse::upsert($data, ['group_id', 'course_id'], ['granted_by', 'granted_at']);

        return back()->with('success', 'Курсы назначены группе');
    }

// Назначение домашнего задания группе
    public function assignHomework(Request $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $validated = $request->validate([
            'homework_ids'   => 'required|array',
            'homework_ids.*' => 'integer|exists:homeworks,id',
        ]);

        $homeworkIds = Homework::whereIn('id', $validated['homework_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        if ($homeworkIds->isEmpty()) {
            return back()->with('error', 'Нет доступных ДЗ для назначения.');
        }

        // ✅ Массовое создание через upsert (1 SQL-запрос вместо N)
        // Хук created в модели GroupHomework автоматически раздаст ДЗ студентам через upsert
        $data = $homeworkIds->map(fn($homeworkId) => [
            'group_id'     => $group->id,
            'homework_id'  => $homeworkId,
            'granted_by'   => auth()->user()->name ?? 'admin',
            'granted_at'   => now(),
        ])->toArray();

        GroupHomework::upsert(
            $data,
            ['group_id', 'homework_id'], // Уникальные ключи для проверки дубликатов
            ['granted_by', 'granted_at'] // Колонки для обновления при совпадении
        );

        return back()->with('success', 'Домашние задания назначены группе');
    }

// Назначение экзамена группе
    public function assignExam(Request $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $validated = $request->validate([
            'exam_ids'   => 'required|array',
            'exam_ids.*' => 'integer|exists:exams,id',
        ]);

        $examIds = Exam::whereIn('id', $validated['exam_ids'])
            ->where('organization_id', $organization->id)
            ->pluck('id');

        if ($examIds->isEmpty()) {
            return back()->with('error', 'Нет доступных экзаменов для назначения.');
        }

        // ✅ Массовое создание через upsert (1 SQL-запрос вместо N)
        $data = $examIds->map(fn($examId) => [
            'group_id'   => $group->id,
            'exam_id'    => $examId,
            'granted_by' => auth()->user()->name ?? 'admin',
            'granted_at' => now(),
        ])->toArray();

        GroupExam::upsert(
            $data,
            ['group_id', 'exam_id'],
            ['granted_by', 'granted_at']
        );

        return back()->with('success', 'Экзамены назначены группе');
    }

    public function removeCourse(Organization $organization, Group $group, GroupCourse $groupCourse)
    {
        $this->authorize('consoleAction', $organization);

        // ✅ Проверка: принадлежит ли запись группе И организации
        abort_unless($groupCourse->group_id === $group->id, 404);
        abort_unless($group->organization_id === $organization->id, 404);

        // Удаление записи group_course
        // Хук deleted в модели GroupCourse автоматически удалит StudentCourse у всех студентов группы
        $groupCourse->delete();

        return back()->with('success', 'Курс удалён из группы');
    }

// Удаление домашнего задания из группы
    public function removeHomework(Organization $organization, Group $group, GroupHomework $groupHomework)
    {
        $this->authorize('consoleAction', $organization);

        // ✅ Проверка: принадлежит ли запись группе И организации
        abort_unless($groupHomework->group_id === $group->id, 404);
        abort_unless($group->organization_id === $organization->id, 404);

        // Хук deleted в модели GroupHomework автоматически удалит StudentHomework у всех студентов группы
        $groupHomework->delete();

        return back()->with('success', 'Домашнее задание удалено из группы');
    }

// Удаление экзамена из группы
    public function removeExam(Organization $organization, Group $group, GroupExam $groupExam)
    {
        $this->authorize('consoleAction', $organization);

        // ✅ Проверка: принадлежит ли запись группе И организации
        abort_unless($groupExam->group_id === $group->id, 404);
        abort_unless($group->organization_id === $organization->id, 404);

        // Хук deleted в модели GroupExam автоматически удалит StudentExam у всех студентов группы
        $groupExam->delete();

        return back()->with('success', 'Экзамен удалён из группы');
    }
}
