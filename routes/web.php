<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\MathJamController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionController;
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
    Route::get('/math-journey', function () {
        return Inertia::render('Teacher/CreateJam');
    })->name('math.journey');

    Route::post('/math-journey/create', [MathJamController::class, 'create']);
    Route::get('/math-journey/check-existing', [MathJamController::class, 'checkExistingJam']);
    Route::get('/math-journey/stream-participants', [MathJamController::class, 'streamMathJamParticipants']);
    Route::post('/math-journey/cancel', [MathJamController::class, 'cancelJam']);

    Route::get('/board', function () {
        return Inertia::render('Jam/BoardContainer', request()->all());
    })->name('jam.BoardContainer');

    Route::get('/questions', [QuestionController::class, 'index'])->name('questions');
    Route::post('/questions/store', [QuestionController::class, 'store'])->name('questions.store');
    Route::get('/math-journey/watch', function () {
        return Inertia::render('Jam/BoardContainer_Journey', request()->all());
    })->name('journey.start');

    Route::get('/modules', function () {
        return Inertia::render('Modules/Modules', request()->all());
    })->name('modules.Modules');

    Route::get('/questions_list_teacher', [QuestionController::class, 'getQuestions']);
    Route::post('/math-journey/update-status', [MathJamController::class, 'update_status']);
    Route::post('/save_ordered_questions', [MathJamController::class, 'saveOrderedQuestions']);
    Route::get('/get_ordered_questions', [MathJamController::class, 'getOrderedQuestions']);
    Route::delete('/ordered-questions/{id}', [MathJamController::class, 'destroy']);
    Route::post('/math-journey/disconnect_jam', [MathJamController::class, 'disconnect_jam']);
});

Route::group(['middleware' => 'student'], function () {
    Route::get('/math-journey-join', function () {
        return Inertia::render('Student/JoinJam');
    });

    Route::post('/math-journey/join', [MathJamController::class, 'joinJam']);
    Route::get('/math-journey/check-status', [MathJamController::class, 'checkStatus']);
    Route::post('/math-journey/disconnect', [MathJamController::class, 'disconnect']);
    Route::post('/math-journey/reconnect', [MathJamController::class, 'reconnect']);
    Route::get('/math-journey/jam-stream-updates', [MathJamController::class, 'jamStreamUpdates']);

    Route::get('/questions_list', [QuestionController::class, 'getQuestions']);

    Route::get('/board', function () {
        return Inertia::render('Jam/BoardContainer', request()->all());
    })->name('jam.BoardContainer');

    Route::get('/math-journey/play', function () {
        return Inertia::render('Jam/BoardContainer_Journey', request()->all());
    })->name('journey.play');
});

Route::group(['middleware' => 'parent'], function () {});

require __DIR__ . '/auth.php';
