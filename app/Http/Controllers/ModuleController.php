<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Answer;
use App\Models\Modules;
use App\Models\Section;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Auth;
use App\Models\ParentStudentRelationship;

class ModuleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'module_name' => 'required|string|max:255',
            'module_desc' => 'required|string|max:255',
            'module_file_desc' => 'required|string|max:255',
            'module_file' => 'nullable|array',
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt',
            'is_submission_required' => 'nullable|in:0,1,true,false',
            'points' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('is_submission_required') && (is_null($value) || $value < 1)) {
                        $fail('The points field is required and must be at least 1 when submission is required.');
                    }
                },
            ],
            'num_of_attempts' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('is_submission_required') && (is_null($value) || $value < 1)) {
                        $fail('The number of attempts field is required and must be at least 1 when submission is required.');
                    }
                },
            ],
            'submit_type' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('is_submission_required') && empty($value)) {
                        $fail('The submit type field is required when submission is required.');
                    }
                },
            ],
            'file_type' => 'nullable|string|max:255',
            'is_comment_enabled' => 'nullable|in:0,1,true,false',
            'due_date' => [
                'required',
                'date',
                function ($attribute, $value, $fail) {
                    if ($request->boolean('is_submission_required') && empty($value)) {
                        if (Carbon::parse($value)->lt(Carbon::now())) {
                            $fail('The due date and time must be in the future.');
                        }
                    }
                }
            ],
        ]);

        $filePaths = [];
        $fileNames = [];

        if ($request->hasFile('module_file')) {
            foreach ($request->file('module_file') as $file) {
                $fileNameWithoutExtension = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $fileExtension = $file->getClientOriginalExtension();
                $fileName = $fileNameWithoutExtension;
                $filePath = $fileNameWithoutExtension . '.' . $fileExtension;

                $file->move(public_path('modules'), $filePath);

                $filePaths[] = $filePath;
                $fileNames[] = $fileName;
            }
        }

        $formattedDueDate = Carbon::parse($request->due_date)->format('Y-m-d H:i:s');

        if (!$request->boolean('is_submission_required')) {
            $request->merge([
                'is_comment_enabled' => 0,
                'points' => null,
                'num_of_attempts' => null,
                'submit_type' => '',
                'file_type' => '',
                'due_date' => ''
            ]);
        }

        Modules::create([
            'section_id' => $request->section_id,
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
            'is_submission_required' => $request->boolean('is_submission_required'),
            'is_comment_enabled' => $request->boolean('is_comment_enabled'),
            'points' => $request->boolean('is_submission_required') ? $request->points : null,
            'num_of_attempts' => $request->boolean('is_submission_required') ? $request->num_of_attempts : null,
            'submit_type' => $request->boolean('is_submission_required') ? $request->submit_type : '',
            'file_type' => $request->file_type,
            'due_date' => $formattedDueDate,
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Added Announcement: ' . $request->module_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Announcement added successfully!'
        ]);
    }

    public function get_module($id)
    {
        $module = Modules::find($id);

        if (!$module) {
            return response()->json([
                'message' => 'Announcement not found!'
            ], 404);
        }

        return response()->json([
            'module' => $module
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'module_name' => 'required|string|max:255',
            'module_desc' => 'required|string|max:255',
            'module_file_desc' => 'required|string|max:255',
            'module_file' => 'nullable|array',
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt',
            'is_submission_required' => 'nullable|in:0,1,true,false',
            'points' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('is_submission_required') && (is_null($value) || $value < 1)) {
                        $fail('The points field is required and must be at least 1 when submission is required.');
                    }
                },
            ],
            'num_of_attempts' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('is_submission_required') && (is_null($value) || $value < 1)) {
                        $fail('The number of attempts field is required and must be at least 1 when submission is required.');
                    }
                },
            ],
            'submit_type' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->boolean('is_submission_required') && empty($value)) {
                        $fail('The submit type field is required when submission is required.');
                    }
                },
            ],
            'file_type' => 'nullable|string|max:255',
            'is_comment_enabled' => 'nullable|in:0,1,true,false',
            'due_date' => [
                'required',
                'date',
                function ($attribute, $value, $fail) {
                    if (Carbon::parse($value)->lt(Carbon::now())) {
                        $fail('The due date and time must be in the future.');
                    }
                }
            ],
        ]);

        $module = Modules::findOrFail($id);

        $filePaths = explode(',', $module->file_path);
        $fileNames = explode(',', $module->file_name);

        if ($request->hasFile('module_file')) {
            foreach ($request->file('module_file') as $file) {
                $fileNameWithoutExtension = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $fileExtension = $file->getClientOriginalExtension();
                $fileName = $fileNameWithoutExtension;

                if (in_array($fileName, $fileNames)) {
                    continue;
                }

                $filePath = $fileNameWithoutExtension . '.' . $fileExtension;
                $file->move(public_path('modules'), $filePath);

                $filePaths[] = $filePath;
                $fileNames[] = $fileName;
            }
        }

        $formattedDueDate = Carbon::parse($request->due_date)->format('Y-m-d H:i:s');

        if (!$request->boolean('is_submission_required')) {
            $request->merge([
                'is_comment_enabled' => 0,
                'points' => 0,
                'num_of_attempts' => 0,
                'submit_type' => '',
                'file_type' => '',
                'due_date' => ''
            ]);
        }

        $module->update([
            'section_id' => $request->section_id,
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
            'is_submission_required' => $request->boolean('is_submission_required'),
            'is_comment_enabled' => $request->boolean('is_comment_enabled'),
            'points' => $request->points,
            'num_of_attempts' => $request->num_of_attempts,
            'submit_type' => $request->submit_type,
            'file_type' => $request->file_type,
            'due_date' => $formattedDueDate,
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Update Announcement: ' . $module->mdule_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Announcement updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $module = Modules::findOrFail($id);

        $module->delete();

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Delete Announcement: ' . $module->module_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Announcement deleted successfully!'
        ]);
    }

    public function get_modules()
    {
        $user_type = Auth::user()->user_type;

        if ($user_type == 'Parent') {
            $student_ids = ParentStudentRelationship::join('users', 'users.id', '=', 'parent_student_relation.student_id')
                ->where('parent_student_relation.status', 0)
                ->where('users.status', 0)
                ->where('parent_student_relation.parent_id', Auth::user()->id)
                ->pluck('parent_student_relation.student_id');

            $section_ids = User::whereIn('id', $student_ids)->pluck('section_id');

            $modules = Modules::whereIn('section_id', $section_ids)
                ->distinct()
                ->get();

            return response()->json($modules);
        } else if ($user_type == 'Student') {
            $sectionId = Auth::user()->section_id;
            $studentId = Auth::user()->id;

            $modules = Modules::leftJoin('module_submissions', function ($join) use ($studentId) {
                $join->on('modules.id', '=', 'module_submissions.module_id')
                    ->where('module_submissions.student_id', '=', $studentId);
            })
                ->where('modules.section_id', $sectionId)
                ->select('modules.*', 'module_submissions.score')
                ->get();

            return response()->json($modules);
        } else {
            $sectionId = Auth::user()->section_id;

            $totalStudents = User::where('user_type', 'Student')
                ->where('section_id', $sectionId)
                ->count();

            $modules = Modules::where('modules.section_id', $sectionId)
                ->leftJoin('module_submissions', 'modules.id', '=', 'module_submissions.module_id')
                ->select('modules.*')
                ->selectRaw('? as total_students', [$totalStudents])
                ->selectRaw('(SELECT COUNT(DISTINCT student_id) FROM module_submissions WHERE module_submissions.module_id = modules.id) as students_submitted')
                ->distinct('modules.id')
                ->get();

            return response()->json($modules);
        }
    }

    public function destroy_single($id, $index)
    {
        $module = Modules::findOrFail($id);

        $fileNames = explode(',', $module->file_name);
        $filePaths = explode(',', $module->file_path);

        $deletedFileName = $fileNames[$index];
        $deletedFilePath = public_path('modules/' . $filePaths[$index]);

        if (file_exists($deletedFilePath)) {
            unlink($deletedFilePath);
        }

        unset($fileNames[$index]);
        unset($filePaths[$index]);

        $fileNames = array_values($fileNames);
        $filePaths = array_values($filePaths);

        $module->file_name = implode(',', $fileNames);
        $module->file_path = implode(',', $filePaths);
        $module->save();

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Deleted Announcement file: "' . $deletedFileName . '"' . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Announcement file deleted successfully!'
        ]);
    }

    public function submit_answer(Request $request)
    {
        $request->validate([
            'module_id' => 'required|integer',
            'text_answer' => 'nullable|string',
            'module_file' => 'nullable|file',
            'comments' => 'nullable|string',
            'score' => 'nullable|integer',
            'total_attempts' => 'nullable|integer',
        ]);

        $studentId = Auth::user()->id;
        $moduleId = $request->input('module_id');

        $module = Modules::where('id', $moduleId)->first();
        if (!$module) {
            return response()->json(['message' => 'Module not found!'], 404);
        }

        $numOfAttempts = $module->num_of_attempts;
        $dueDate = $module->due_date;
        $currentDateTime = now();

        if ($dueDate && $currentDateTime->greaterThan($dueDate)) {
            return response()->json(['message' => 'The deadline for this module has passed!'], 403);
        }

        $existingAnswer = Answer::where('student_id', $studentId)
            ->where('module_id', $moduleId)
            ->first();

        if ($existingAnswer && $existingAnswer->score !== 0) {
            return response()->json(['message' => 'You have already received a score for this module, resubmission is not allowed!'], 403);
        }

        if ($existingAnswer && $existingAnswer->total_attempts >= $numOfAttempts) {
            return response()->json(['message' => 'Maximum number of attempts reached!'], 403);
        }

        $fileTypeMappings = [
            'png/jpeg/jpg' => ['png', 'jpeg', 'jpg'],
            'video' => ['mp4', 'avi', 'mov', 'mkv'],
            'pdf' => ['pdf'],
            'doc/docx' => ['doc', 'docx'],
            'txt' => ['txt'],
            'xls/xlsx' => ['xls', 'xlsx'],
            'ppt/pptx' => ['ppt', 'pptx'],
            'any' => []
        ];

        $allowedFileTypes = explode(',', $module->file_type);
        $allowedExtensions = [];

        foreach ($allowedFileTypes as $type) {
            $type = trim($type);
            if (isset($fileTypeMappings[$type])) {
                $allowedExtensions = array_merge($allowedExtensions, $fileTypeMappings[$type]);
            }
        }

        $fileName = null;
        if ($request->hasFile('module_file')) {
            $file = $request->file('module_file');
            $fileExtension = strtolower($file->getClientOriginalExtension());

            if ($module->file_type !== 'any' && !in_array($fileExtension, $allowedExtensions)) {
                return response()->json(['message' => 'Invalid file type! Allowed file types: ' . implode(', ', $allowedExtensions)], 400);
            }

            $fileNameWithoutExtension = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $fileName = $fileNameWithoutExtension;
            $counter = 1;

            while (file_exists(public_path("module_submissions/{$fileName}.{$fileExtension}"))) {
                $fileName = "{$fileNameWithoutExtension} ({$counter})";
                $counter++;
            }

            $fileName = "{$fileName}.{$fileExtension}";
            $file->move(public_path('module_submissions'), $fileName);
        }

        if ($existingAnswer) {
            $newAttempt = $existingAnswer->total_attempts + 1;
            $ordinalAttempt = $this->ordinal($newAttempt);

            $existingAnswer->update([
                'text_answer' => $request->input('text_answer', $existingAnswer->text_answer),
                'upload_file' => $fileName ?? $existingAnswer->upload_file,
                'comment' => $request->input('comments', $existingAnswer->comment),
                'score' => $request->input('score', $existingAnswer->score),
                'total_attempts' => $newAttempt,
            ]);

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => "Resubmit Answer for {$module->module_name} ({$ordinalAttempt} Attempt)",
                'created_at' => now()
            ]);

            return response()->json(['message' => 'Answer updated successfully!'], 200);
        } else {
            Answer::create([
                'student_id' => $studentId,
                'module_id' => $moduleId,
                'text_answer' => $request->input('text_answer'),
                'upload_file' => $fileName,
                'comment' => $request->input('comments'),
                'score' => $request->input('score'),
                'total_attempts' => 1,
            ]);

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => "Submit Answer for {$module->module_name} (1st Attempt)",
                'created_at' => now()
            ]);

            return response()->json(['message' => 'Answer submitted successfully!'], 200);
        }
    }

    private function ordinal($number)
    {
        $suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
        if (($number % 100) >= 11 && ($number % 100) <= 13) {
            return $number . 'th';
        }
        return $number . $suffixes[$number % 10];
    }

    public function get_submissions()
    {
        $submissions = DB::table('module_submissions as ms')
            ->join('users as u', 'ms.student_id', '=', 'u.id')
            ->select(
                'ms.id as module_answer_id',
                'ms.student_id',
                'ms.module_id',
                'u.name',
                'ms.text_answer',
                'ms.upload_file',
                'ms.comment',
                'ms.score',
                'ms.created_at'
            )
            ->get();

        $formattedSubmissions = $submissions->map(function ($submission) {
            return [
                'student_id' => $submission->student_id,
                'module_answer_id' => $submission->module_answer_id,
                'module_id' => $submission->module_id,
                'name' => $submission->name ?? 'Unknown Student',
                'text_answer' => $submission->text_answer,
                'uploadFile' => $submission->upload_file,
                'comments' => $submission->comment ?? 'No comment',
                'score' => $submission->score ?? 0,
                'date_submitted' => $submission->created_at
                    ? Carbon::parse($submission->created_at)->format('F j, Y \a\t g:i A')
                    : null,
            ];
        });

        return response()->json($formattedSubmissions);
    }

    public function saveScore(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:module_submissions,student_id',
            'module_id' => 'required|exists:module_submissions,module_id',
            'score' => 'required|numeric|min:0',
        ]);

        $module = Modules::where('id', $request->module_id)->first();

        if (!$module) {
            return response()->json(['message' => 'Module not found.'], 404);
        }

        if ($request->score > $module->points) {
            return response()->json(['message' => 'Score cannot exceed module points.'], 422);
        }

        $submission = Answer::where('student_id', $request->student_id)
            ->where('module_id', $request->module_id)
            ->join('users', 'users.id', '=', 'module_submissions.student_id')
            ->select('module_submissions.*', 'users.name as student_name')
            ->first();

        if (!$submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $previousScore = $submission->score;

        $submission->score = $request->score;
        $submission->save();

        if ($previousScore !== 0) {
            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => "Updated Score for {$module->module_name} - Student: {$submission->student_name} (From: {$previousScore} To: {$request->score})",
                'created_at' => now()
            ]);
        } else {
            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => "Submitted Score for {$module->module_name} - Student: {$submission->student_name}",
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Score saved successfully!',
            'submission' => $submission
        ], 200);
    }
}
