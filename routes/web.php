<?php

use App\Http\Controllers\BotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/error/{status}', function ($status) {
    return Inertia::render('Error', ['status' => $status]);
})->name('error');

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('organization', OrganizationController::class);
    Route::resource('invitations', InvitationController::class);
    Route::resource('bot', BotController::class)->except('toggleStatus');
    Route::get('/organization/{organization}/admin', [OrganizationController::class, 'admin'])
        ->name('organization.admin');
    Route::post('/bot/{bot}/toggle', [BotController::class, 'toggleStatus'])
        ->name('bot.toggle');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
