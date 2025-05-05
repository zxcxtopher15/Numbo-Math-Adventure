<?php

use Inertia\Inertia;
use App\Models\Category;
use App\Models\GameType;
use App\Models\AuditTrail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\MathJamController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GameTypeController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AuditTrailController;
use App\Http\Controllers\UserManagementController;
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
Route::post('/send-otp-registration', [OtpController::class, 'send_otp_registration'])->name('send-otp');
Route::post('/verify-otp-registration', [OtpController::class, 'verify_otp_registration'])->name('verify-otp');

Route::post('/modules/store', [ModuleController::class, 'store'])->name('modules.store');
Route::get('/modules/{id}', [ModuleController::class, 'get_module'])->name('modules.get');
Route::get('/get-module-score', [ModuleController::class, 'getScore']);
Route::post('/modules/update/{id}', [ModuleController::class, 'update'])->name('modules.update');
Route::delete('/modules/{id}', [ModuleController::class, 'destroy'])->name('modules.destroy');
Route::get('/get_all_modules', [ModuleController::class, 'get_modules']);
Route::get('/get_all_submissions', [ModuleController::class, 'get_submissions']);
Route::delete('/modules/single/{id}/{index}', [ModuleController::class, 'destroy_single'])->name('modules.delete');
Route::post('/math-practice/update_has_answer', [MathJamController::class, 'update_has_answer']);
Route::post('/math-practice/update_answers', [MathJamController::class, 'update_answers']);

Route::get('/dashboard', function () {
    if (Auth::check()) {
        $user = Auth::user();

        if (in_array($user->user_type, ['Teacher', 'Student']) && $user->section_id == 0) {
            Auth::logout();
            return redirect(url('login'))->withErrors(['error' => 'Your account is not assigned to any section.']);
        }
    }

    $gameTypes = GameType::where('game_type.status', 0)
        ->where('game_type.section_id', Auth::user()->section_id)
        ->where('game_type.status', 0)
        ->where('C.status', 0)
        ->leftJoin('category as C', 'game_type.id', '=', 'C.game_type_id')
        ->select(
            'game_type.id as id',
            'game_type.game_type_name as title',
            'game_type.description',
            'C.id as category_id',
            'C.category_name as category_title',
            'C.description as category_description',
            'C.example as category_sample'
        )
        ->get();

    $colors = [
        ['gradient' => 'from-[#CDDA1E] to-[#50DE65]', 'text' => 'text-[#50DE65]'],
        ['gradient' => 'from-[#EC4899] to-[#FBBF24]', 'text' => 'text-[#FBBF24]'],
        ['gradient' => 'from-[#EC4899] to-[#8B5CF6]', 'text' => 'text-[#8B5CF6]'],
        ['gradient' => 'from-[#34D399] to-[#6366F1]', 'text' => 'text-[#6366F1]'],
    ];


    $formattedData = $gameTypes->groupBy('id')->values()->map(function ($items, $index) use ($colors) {
        $gameType = $items->first();
        $color = $colors[$index % count($colors)];

        $categories = $items->map(function ($item) {
            if (!$item->category_id) return null;
            return [
                'id' => $item->category_id,
                'title' => $item->category_title ?? '',
                'description' => $item->category_description ?? '',
                'sample' => $item->category_sample ?? '',
            ];
        })->filter()->values();

        if ($categories->isEmpty()) {
            return null;
        }

        $categories->prepend([
            'id' => 0,
            'title' => 'Custom Game',
            'description' => 'Design your own challenges.',
            'sample' => 'Create a set of custom problems.',
        ]);

        return [
            'id' => $gameType->id,
            'title' => $gameType->title,
            'description' => $gameType->description,
            'gradient' => $color['gradient'],
            'textColor' => $color['text'],
            'items' => $categories,
        ];
    })->filter()->values();

    return Inertia::render('Dashboard', ['data' => $formattedData]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/student-results', [MathJamController::class, 'getStudentResults']);
Route::get('/parent-student-results', [MathJamController::class, 'getStudentResultsParent']);
Route::get('/admin-student-results', [MathJamController::class, 'getStudentResultsAdministrator']);
Route::get('/top-student-results', [MathJamController::class, 'getTopStudents']);


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
    Route::get('/section_list', [SectionController::class, 'index'])->name('admin.sections');

    Route::post('/save_section', [SectionController::class, 'store']);
    Route::delete('/delete_section', [SectionController::class, 'destroy']);
    Route::post('/assign-teacher', [SectionController::class, 'assignTeacher'])->name('assign.teacher');
    Route::post('/remove-assigned-teacher', [SectionController::class, 'unassignTeacher'])->name('unassign.teacher');

    Route::get('/audit_trail', [AuditTrailController::class, 'index'])->name('admin.audit_trail');
    Route::get('/user_management', [UserManagementController::class, 'index'])->name('admin.user_management');
    Route::post('/approve_users', [UserManagementController::class, 'approveUsers'])->name('approve.users');
    Route::post('/reject_users', [UserManagementController::class, 'rejectUsers'])->name('reject.users');
    Route::post('/restore_users', [UserManagementController::class, 'restoreUsers'])->name('restore.users');
    Route::post('/disable_user/{id}', [UserManagementController::class, 'disableUser'])->name('disable.user');
    Route::post('/enable_users', [UserManagementController::class, 'enableUsers'])->name('enable.users');

    Route::delete('/delete_users', [UserManagementController::class, 'destroy'])->name('delete.destroy');

    Route::get('/user_counts', [UserManagementController::class, 'userCounts']);

    Route::get('/student-section', [SectionController::class, 'admin_index']);
    Route::post('/remove-student-section-admin', [SectionController::class, 'removeFromSectionAdmin']);
    Route::post('/add-student-section-admin', [SectionController::class, 'addToSectionAdmin']);
});

Route::group(['middleware' => 'teacher'], function () {
    Route::get('/math-practice', function () {
        $categories = Category::where('category.status', 0)
            ->where('category.section_id', Auth::user()->section_id)
            ->where('game_type.status', 0)
            ->leftJoin('game_type', 'game_type.id', '=', 'category.game_type_id')
            ->select(
                'category.id as category_id',
                'category.category_name as category',
                'game_type.game_type_name as type',
                'category.game_type_id as game_type_id'
            )
            ->get()
            ->toArray();

        return Inertia::render('Teacher/CreateJam', [
            'categories' => $categories
        ]);
    })->name('math.journey');

    Route::post('/math-practice/create', [MathJamController::class, 'create']);
    Route::get('/math-practice/check-existing', [MathJamController::class, 'checkExistingJam']);
    Route::get('/math-practice/stream-participants', [MathJamController::class, 'streamMathJamParticipants']);
    Route::post('/math-practice/cancel', [MathJamController::class, 'cancelJam']);

    Route::get('/board', function () {
        return Inertia::render('Jam/BoardContainer', request()->all());
    })->name('jam.BoardContainer');

    Route::get('/questions', [QuestionController::class, 'index'])->name('questions');
    Route::post('/questions/store', [QuestionController::class, 'store'])->name('questions.store');
    Route::get('/math-practice/watch', function () {
        return Inertia::render('Jam/BoardContainer_Journey', request()->all());
    })->name('journey.start');

    Route::get('/questions_list_teacher', [QuestionController::class, 'getQuestions']);
    Route::post('/math-practice/update-status', [MathJamController::class, 'update_status']);
    Route::post('/save_ordered_questions', [MathJamController::class, 'saveOrderedQuestions']);
    Route::delete('/ordered-questions/{id}/{math_jam_id}', [MathJamController::class, 'destroy']);
    Route::post('/math-practice/disconnect_jam', [MathJamController::class, 'disconnect_jam']);
    Route::post('/math-practice/update-pause-status', [MathJamController::class, 'updatePauseStatus']);
    Route::post('/math-practice/update_current_question', [MathJamController::class, 'update_current_question']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    Route::get('/questions/{id}', [QuestionController::class, 'getQuestion'])->name('questions.get');
    Route::put('/questions/{id}', [QuestionController::class, 'updateQuestion'])->name('questions.update');
    Route::post('/math-practice/update_score', [MathJamController::class, 'update_score']);

    Route::get('/sections', [SectionController::class, 'teacher_index']);
    Route::post('/remove-student-section', [SectionController::class, 'removeFromSection']);
    Route::post('/add-student-section', [SectionController::class, 'addToSection']);
    Route::post('/game-type/store', [GameTypeController::class, 'store'])->name('gametype.store');
    Route::post('/game-type/destroy', [GameTypeController::class, 'destroy']);
    Route::post('/category/store', [CategoryController::class, 'store']);
    Route::post('/category/destroy', [CategoryController::class, 'destroy']);
    Route::put('/game-types/{id}/status', [GameTypeController::class, 'updateStatus']);
    Route::post('/save-score', [ModuleController::class, 'saveScore'])->name('submit.score');
});

Route::group(['middleware' => 'student'], function () {
    Route::get('/math-practice-join', function () {
        return Inertia::render('Student/JoinJam');
    });

    Route::post('/math-practice/join', [MathJamController::class, 'joinJam']);
    Route::get('/math-practice/check-status', [MathJamController::class, 'checkStatus']);
    Route::get('/math-practice/check-section-jam', [MathJamController::class, 'checkSectionJam']);
    Route::post('/math-practice/disconnect', [MathJamController::class, 'disconnect']);
    Route::post('/math-practice/reconnect', [MathJamController::class, 'reconnect']);
    Route::get('/math-practice/jam-stream-updates', [MathJamController::class, 'jamStreamUpdates']);

    Route::get('/questions_list', [QuestionController::class, 'getQuestions']);

    Route::get('/board', function () {
        return Inertia::render('Jam/BoardContainer', request()->all());
    })->name('jam.BoardContainer');

    Route::get('/math-practice/play', function () {
        return Inertia::render('Jam/BoardContainer_Student', request()->all());
    })->name('journey.play');
    Route::post('/math-practice/update_is_correct', [MathJamController::class, 'update_is_correct']);
    Route::post('/math-practice/exit_jam', [MathJamController::class, 'exit_jam']);
    Route::get('/math-practice/get-score', [MathJamController::class, 'getScore']);
    Route::post('/submit-answer', [ModuleController::class, 'submit_answer'])->name('submit.answer');
    Route::get('/math-practice/get-participants', [MathJamController::class, 'getParticipants']);
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
