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
use Inertia\Inertia;

class GroupController extends Controller
{
    // Список групп
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $groups = $organization->groups()
            ->withCount('students')
            ->get();
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
            'code' => 'nullable|string|max:5',
        ]);

        if (empty($validated['code'])) {
            do {
                $code = strtoupper(Str::random(5));
            } while (Group::where('code', $code)->exists());
            $validated['code'] = $code;
        }
        $validated['organization_id'] = $organization->id;
        Group::create($validated);
        return back()->with('success', 'Группа создана');
    }

    public function show(Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        // Загружаем связи
        $group->load(['students', 'courses.course', 'homeworks.homework', 'exams.exam']);

        // Доступные для назначения курсы (ещё не назначенные группе)
        $assignedCourseIds = $group->courses->pluck('course_id');
        $availableCourses = $organization->courses()->whereNotIn('id', $assignedCourseIds)->get();

        $assignedHomeworkIds = $group->homeworks->pluck('homework_id');
        $availableHomeworks = $organization->homeworks()->whereNotIn('id', $assignedHomeworkIds)->get();

        $assignedExamIds = $group->exams->pluck('exam_id');
        $availableExams = $organization->exams()->whereNotIn('id', $assignedExamIds)->get();

        // Студенты, не состоящие в группе (для добавления)
        $groupStudentIds = $group->students->pluck('id');
        $availableStudents = $organization->students()
            ->whereNotIn('id', $groupStudentIds)
            ->get();

        return Inertia::render('Console/Group/Show', [
            'organization'       => new OrganizationResource($organization),
            'group'              => new GroupResource($group)->resolve(),
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

        $students = Student::whereIn('id', $validated['student_ids'])
            ->where('organization_id', $organization->id)
            ->get();

        foreach ($students as $student) {
            $group->students()->attach($student->id);
            // Выдаём все активные назначения группы
            foreach ($group->courses as $groupCourse) {
                StudentCourse::firstOrCreate([
                    'student_id' => $student->id,
                    'course_id'  => $groupCourse->course_id,
                ], [
                    'organization_id' => $organization->id,
                    'granted_by'      => 'group',
                    'granted_at'      => now(),
                ]);
            }
            foreach ($group->homeworks as $groupHomework) {
                StudentHomework::firstOrCreate([
                    'student_id' => $student->id,
                    'homework_id'=> $groupHomework->homework_id,
                ], [
                    'organization_id' => $organization->id,
                    'granted_by'      => 'group',
                    'granted_at'      => now(),
                ]);
            }
            foreach ($group->exams as $groupExam) {
                StudentExam::firstOrCreate([
                    'student_id' => $student->id,
                    'exam_id'    => $groupExam->exam_id,
                ], [
                    'organization_id' => $organization->id,
                    'granted_by'      => 'group',
                    'granted_at'      => now(),
                ]);
            }
        }

        return back()->with('success', 'Студенты добавлены');
    }

    // Удаление студента из группы
    public function removeStudent(Organization $organization, Group $group, Student $student)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);
        abort_unless($student->organization_id === $organization->id, 404);

        $group->students()->detach($student->id);

        // Удаляем унаследованные от группы назначения
        foreach ($group->courses as $groupCourse) {
            StudentCourse::where('student_id', $student->id)
                ->where('course_id', $groupCourse->course_id)
                ->delete();
        }
        foreach ($group->homeworks as $groupHomework) {
            StudentHomework::where('student_id', $student->id)
                ->where('homework_id', $groupHomework->homework_id)
                ->delete();
        }
        foreach ($group->exams as $groupExam) {
            StudentExam::where('student_id', $student->id)
                ->where('exam_id', $groupExam->exam_id)
                ->delete();
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

        foreach ($courseIds as $courseId) {
            // Создаём запись group_course, что автоматически вызовет создание StudentCourse для участников
            GroupCourse::create([
                'group_id'       => $group->id,
                'course_id'      => $courseId,
                'granted_by'     => auth()->user()->name ?? 'admin',
                'granted_at'     => now(),
            ]);
        }

        return back()->with('success', 'Курсы назначены группе');
    }

    public function removeCourse(Organization $organization, Group $group, GroupCourse $groupCourse)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($groupCourse->group_id === $group->id, 404);
        $groupCourse->delete(); // событие deleted очистит StudentCourse
        return back()->with('success', 'Курс удалён из группы');
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

        foreach ($homeworkIds as $homeworkId) {
            GroupHomework::create([
                'group_id'       => $group->id,
                'homework_id'    => $homeworkId,
                'granted_by'     => auth()->user()->name ?? 'admin',
                'granted_at'     => now(),
            ]);
        }

        return back()->with('success', 'Домашние задания назначены группе');
    }

// Удаление домашнего задания у группы
    public function removeHomework(Organization $organization, Group $group, GroupHomework $groupHomework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($groupHomework->group_id === $group->id, 404);
        $groupHomework->delete(); // событие deleted очистит StudentHomework
        return back()->with('success', 'Домашнее задание удалено из группы');
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

        foreach ($examIds as $examId) {
            GroupExam::create([
                'group_id'       => $group->id,
                'exam_id'        => $examId,
                'granted_by'     => auth()->user()->name ?? 'admin',
                'granted_at'     => now(),
            ]);
        }

        return back()->with('success', 'Экзамены назначены группе');
    }

// Удаление экзамена у группы
    public function removeExam(Organization $organization, Group $group, GroupExam $groupExam)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($groupExam->group_id === $group->id, 404);
        $groupExam->delete(); // событие deleted очистит StudentExam
        return back()->with('success', 'Экзамен удалён из группы');
    }
}
