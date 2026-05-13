<?php

use App\Http\Controllers\Console\ConsoleController;
use App\Http\Controllers\Console\CourseController;
use App\Http\Controllers\Console\LessonController;
use App\Http\Controllers\Console\LessonMaterialController;
use App\Http\Controllers\Console\LessonTaskController;
use App\Http\Controllers\Console\ModuleController;
use App\Http\Controllers\Console\QuestionController;
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

    Route::resource('organization/{organization}/console/module', ModuleController::class);
    Route::patch('organizations/{organization}/courses/{course}/modules-reorder', [ModuleController::class, 'reorder'])
        ->name('module.reorder');

    Route::resource('organization/{organization}/console/lesson', LessonController::class);
    Route::patch('organizations/{organization}/modules/{module}/lessons-reorder', [LessonController::class, 'reorder'])
        ->name('lesson.reorder');

    Route::resource('organization/{organization}/console/task', LessonTaskController::class);
    Route::patch('organizations/{organization}/lesson/{lesson}/task-reorder', [LessonTaskController::class, 'reorder'])
        ->name('task.reorder');

    Route::resource('organization/{organization}/console/material', LessonMaterialController::class);
    Route::patch('organizations/{organization}/lesson/{lesson}/material-reorder', [LessonMaterialController::class, 'reorder'])
        ->name('material.reorder');

    Route::resource('organization/{organization}/console/question', QuestionController::class);
    Route::patch('organizations/{organization}/Tasks/{task}/questions-reorder', [QuestionController::class, 'reorder'])
        ->name('question.reorder');

});


Route::get('/invitation/{token}/accept', [InvitationController::class, 'accept'])
    ->name('invitation.accept');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
