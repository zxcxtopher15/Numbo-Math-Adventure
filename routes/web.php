<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\MathJamController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::get('/', [AuthenticatedSessionController::class, 'create'])
    ->name('login');

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
});

Route::group(['middleware' => 'teacher'], function () {
    Route::get('/math-jams', function () {
        return Inertia::render('Teacher/CreateJam');
    });

    Route::post('/math-jams/create', [MathJamController::class, 'create']);
    Route::get('/math-jams/check-existing', [MathJamController::class, 'checkExistingJam']);
    Route::get('/math-jams/stream-updates', [MathJamController::class, 'streamMathJamUpdates']);
    Route::post('/math-jams/cancel', [MathJamController::class, 'cancelJam']);

    Route::get('/board', function () {
        return Inertia::render('Jam/BoardContainer', request()->all());
    })->name('jam.BoardContainer');
});

Route::group(['middleware' => 'student'], function () {
    Route::get('/math-jams-join', function () {
        return Inertia::render('Student/JoinJam');
    });

    Route::post('/math-jams/join', [MathJamController::class, 'joinJam']);
    Route::get('/math-jams/check-status', [MathJamController::class, 'checkStatus']);
    Route::post('/math-jams/disconnect', [MathJamController::class, 'disconnect']);
    Route::post('/math-jams/reconnect', [MathJamController::class, 'reconnect']);
    Route::get('/math-jams/jam-stream-updates', [MathJamController::class, 'jamStreamUpdates']);
});

Route::group(['middleware' => 'parent'], function () {});

require __DIR__ . '/auth.php';
