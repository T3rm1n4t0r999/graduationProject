<?php

use App\Http\Controllers\Console\ConsoleController;
use App\Http\Controllers\Console\CourseController;
use App\Http\Controllers\Console\ExamController;
use App\Http\Controllers\Console\GroupController;
use App\Http\Controllers\Console\HomeworkController;
use App\Http\Controllers\Console\LessonController;
use App\Http\Controllers\Console\LessonMaterialController;
use App\Http\Controllers\Console\LessonTaskController;
use App\Http\Controllers\Console\ModuleController;
use App\Http\Controllers\Console\ProgressCheckController;
use App\Http\Controllers\Console\QuestionController;
use App\Http\Controllers\Console\StudentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Organization\BotController;
use App\Http\Controllers\Organization\InvitationController;
use App\Http\Controllers\Organization\OrganizationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/error/{status}', function ($status) {
    return Inertia::render('Error', ['status' => $status]);
})->name('error');

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');
Route::get('/guide', function () {
    return Inertia::render('Guide');
})->name('guide');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('organization', OrganizationController::class)->except( 'verifyEmail', 'resendVerification');
    Route::resource('invitation', InvitationController::class);

    Route::resource('bot', BotController::class)->except('toggleStatus');
    Route::post('/bot/{bot}/toggle', [BotController::class, 'toggleStatus'])
        ->name('bot.toggle');
    Route::get('/organization/verify/{token}', [OrganizationController::class, 'verifyEmail'])
        ->name('organization.verify');
    Route::post('/organization/{organization}/resend-verification-link', [OrganizationController::class, 'resendVerification'])
        ->name('organization.resendVerification');
    Route::get('/organization/{organization}/console', [ConsoleController::class, 'index'])
        ->name('organization.console');

    Route::resource('organization/{organization}/console/course', CourseController::class);
    Route::patch('/organization/{organization}/courses-reorder', [CourseController::class, 'reorder'])
        ->name('course.reorder');
    Route::get('/organizations/{organization}/courses/all', [CourseController::class, 'allForReorder'])
        ->name('course.all');

    Route::resource('organization/{organization}/console/module', ModuleController::class);
    Route::patch('organizations/{organization}/courses/{course}/modules-reorder', [ModuleController::class, 'reorder'])
        ->name('module.reorder');
    Route::get('/organizations/{organization}/courses/{course}/modules/all',
        [ModuleController::class, 'allForReorder'])
        ->name('module.all');


    Route::resource('organization/{organization}/console/lesson', LessonController::class);
    Route::patch('organizations/{organization}/modules/{module}/lessons-reorder', [LessonController::class, 'reorder'])
        ->name('lesson.reorder');
    Route::get('/organizations/{organization}/lessons/all', [LessonController::class, 'allForReorder'])
        ->name('lesson.all');

    Route::resource('organization/{organization}/console/task', LessonTaskController::class);
    Route::patch('organizations/{organization}/lesson/{lesson}/task-reorder', [LessonTaskController::class, 'reorder'])
        ->name('task.reorder');
    Route::get('/organizations/{organization}/lessonTasks/all', [LessonTaskController::class, 'allForReorder'])
        ->name('lessonTask.all');

    Route::resource('organization/{organization}/console/homework', HomeworkController::class);

    // Контрольные работы
    Route::resource('organization/{organization}/console/exam', ExamController::class);

    // Материалы задания
    Route::resource('organization/{organization}/console/material', LessonMaterialController::class);
    Route::patch('organizations/{organization}/lesson/{lesson}/material-reorder', [LessonMaterialController::class, 'reorder'])
        ->name('material.reorder');
    Route::get('/organizations/{organization}/materials/all', [LessonMaterialController::class, 'allForReorder'])
        ->name('materials.all');

    // Задания уроков
    Route::get('organization/{organization}/console/question/task', [QuestionController::class, 'taskIndex'])->name('question.task.index');
    Route::patch('organizations/{organization}/task/{task}/questions-reorder', [QuestionController::class, 'reorder'])
        ->name('question.task.reorder');
    Route::get('/organizations/{organization}/task/{task}/questions/all', [QuestionController::class, 'allForReorderTask'])
        ->name('questions.task.all');

    // Контрольные работы
    Route::get('organization/{organization}/console/question/exam', [QuestionController::class, 'examIndex'])->name('question.exam.index');
    Route::patch('organizations/{organization}/exam/{exam}/questions-reorder', [QuestionController::class, 'reorder'])
        ->name('question.exam.reorder');
    Route::get('/organizations/{organization}/exam/{exam}/questions/all', [QuestionController::class, 'allForReorderExam'])
        ->name('questions.exam.all');

    // Домашние задания
    Route::get('organization/{organization}/console/question/homework', [QuestionController::class, 'homeworkIndex'])->name('question.homework.index');
    Route::patch('organizations/{organization}/homework/{homework}/questions-reorder', [QuestionController::class, 'reorder'])
        ->name('question.homework.reorder');
    Route::get('/organizations/{organization}/homework/{homework}/questions/all', [QuestionController::class, 'allForReorderHomework'])
        ->name('questions.homework.all');

    Route::resource('organization/{organization}/console/question', QuestionController::class);

    // Студенты
    Route::get('organization/{organization}/console/students', [StudentController::class, 'index'])
        ->name('student.index');
    Route::get('organization/{organization}/console/students/{student}', [StudentController::class, 'show'])
        ->name('student.show');

    // Назначение (batch)
    Route::post('organization/{organization}/console/students/{student}/courses/assign', [StudentController::class, 'assignCourses'])
        ->name('student.course.assign');
    Route::post('organization/{organization}/console/students/{student}/homeworks/assign', [StudentController::class, 'assignHomeworks'])
        ->name('student.homework.assign');
    Route::post('organization/{organization}/console/students/{student}/exams/assign', [StudentController::class, 'assignExams'])
        ->name('student.exam.assign');

    // Удаление (batch)
    Route::post('organization/{organization}/console/students/{student}/courses/remove', [StudentController::class, 'removeCourses'])
        ->name('student.course.remove');
    Route::post('organization/{organization}/console/students/{student}/homeworks/remove', [StudentController::class, 'removeHomeworks'])
        ->name('student.homework.remove');
    Route::post('organization/{organization}/console/students/{student}/exams/remove', [StudentController::class, 'removeExams'])
        ->name('student.exam.remove');

    Route::get('organizations/{organization}/students/{student}/progress/{progress}', [StudentController::class, 'progressShow'])
        ->name('student.progress.show');

    Route::get('organizations/{organization}/students/{student}/progress', [StudentController::class, 'progress'])
        ->name('student.progress.index');

    Route::prefix('organizations/{organization}/progress')->name('progress.')->group(function () {
        Route::get('check', [ProgressCheckController::class, 'index'])->name('check.index');
        Route::get('{progress}/check', [ProgressCheckController::class, 'show'])->name('check.show');
        Route::put('{progress}/check', [ProgressCheckController::class, 'update'])->name('check.update');
    });

    Route::resource('organizations/{organization}/groups', GroupController::class)
        ->names('group')
        ->parameters(['groups' => 'group']);

    Route::post('organizations/{organization}/groups/{group}/invitations', [InvitationController::class, 'storeForGroup'])
        ->name('group.invitation.store');

// Дополнительные маршруты для управления связями
    Route::prefix('organizations/{organization}/groups/{group}')->name('group.')->group(function () {
        // Студенты
        Route::post('/students', [GroupController::class, 'addStudents'])->name('student.add');
        Route::delete('/students/{student}', [GroupController::class, 'removeStudent'])->name('student.remove');

        // Курсы
        Route::post('/courses', [GroupController::class, 'assignCourse'])->name('course.assign');
        Route::delete('/courses/{groupCourse}', [GroupController::class, 'removeCourse'])->name('course.remove');

        // Домашние задания
        Route::post('/homeworks', [GroupController::class, 'assignHomework'])->name('homework.assign');
        Route::delete('/homeworks/{groupHomework}', [GroupController::class, 'removeHomework'])->name('homework.remove');

        // Экзамены
        Route::post('/exams', [GroupController::class, 'assignExam'])->name('exam.assign');
        Route::delete('/exams/{groupExam}', [GroupController::class, 'removeExam'])->name('exam.remove');
    });
});


Route::get('/invitation/{token}/accept', [InvitationController::class, 'accept'])
    ->name('invitation.accept');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
