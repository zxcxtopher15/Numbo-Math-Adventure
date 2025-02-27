<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\ModuleController;
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

Route::post('/send-otp', [OtpController::class, 'sendOtp']);
Route::post('/verify-otp', [OtpController::class, 'verifyOtp']);

Route::post('/modules/store', [ModuleController::class, 'store'])->name('modules.store');
Route::get('/modules/{id}', [ModuleController::class, 'get_module'])->name('modules.get');
Route::post('/modules/update/{id}', [ModuleController::class, 'update'])->name('modules.update');
Route::delete('/modules/{id}', [ModuleController::class, 'destroy'])->name('modules.destroy');
Route::get('/get_all_modules', [ModuleController::class, 'get_modules']);
Route::delete('/modules/single/{id}/{index}', [ModuleController::class, 'destroy_single'])->name('modules.delete');
Route::post('/math-journey/update_has_answer', [MathJamController::class, 'update_has_answer']);
Route::post('/math-journey/update_answers', [MathJamController::class, 'update_answers']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/student-results', [MathJamController::class, 'getStudentResults']);
Route::get('/parent-student-results', [MathJamController::class, 'getStudentResultsParent']);

Route::get('/view_modules', function () {
    if (Auth::check() && Auth::user()->user_type === 'Administrator') {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Modules/Modules', request()->all());
})->middleware(['auth', 'verified'])->name('view.modules');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/get_ordered_questions', [MathJamController::class, 'getOrderedQuestions']);

Route::group(['middleware' => 'administrator'], function () {
    
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

    Route::get('/questions_list_teacher', [QuestionController::class, 'getQuestions']);
    Route::post('/math-journey/update-status', [MathJamController::class, 'update_status']);
    Route::post('/save_ordered_questions', [MathJamController::class, 'saveOrderedQuestions']);
    Route::delete('/ordered-questions/{id}/{math_jam_id}', [MathJamController::class, 'destroy']);
    Route::post('/math-journey/disconnect_jam', [MathJamController::class, 'disconnect_jam']);
    Route::post('/math-journey/update-pause-status', [MathJamController::class, 'updatePauseStatus']);
    Route::post('/math-journey/update_current_question', [MathJamController::class, 'update_current_question']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    Route::post('/math-journey/update_score', [MathJamController::class, 'update_score']);

    Route::get('/sections', function () {
        return Inertia::render('Teacher/Sections');
    })->name('teacher.sections');
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
        return Inertia::render('Jam/BoardContainer_Student', request()->all());
    })->name('journey.play');
    Route::post('/math-journey/update_is_correct', [MathJamController::class, 'update_is_correct']);
    Route::post('/math-journey/exit_jam', [MathJamController::class, 'exit_jam']);
    Route::get('/math-journey/get-score', [MathJamController::class, 'getScore']);
});

Route::group(['middleware' => 'parent'], function () {
    Route::get('/add-student', function () {

        $students = DB::table('parent_student_relation')
            ->join('users', 'users.id', '=', 'parent_student_relation.student_id')
            ->where('parent_student_relation.parent_id', Auth::id())
            ->where('users.user_type', 'Student')
            ->select('users.id', 'users.name')
            ->get();

        return Inertia::render('Parent/AddStudent', [
            'students' => $students,
        ]);
    });
});

require __DIR__ . '/auth.php';
