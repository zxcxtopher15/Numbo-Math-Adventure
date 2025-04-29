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
            'module_file_desc' => 'nullable|string|max:255',
            'module_file' => 'nullable|array',
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt',
            'is_submission_required' => 'nullable|in:0,1,true,false',
            'modules' => 'required_if:is_submission_required,true|array',
            'modules.*.module_title' => 'required_if:is_submission_required,true|string|max:255',
            'modules.*.points' => 'required_if:is_submission_required,true|integer|min:1',
            'modules.*.num_of_attempts' => 'required_if:is_submission_required,true|integer|min:1',
            'modules.*.submit_type' => 'required_if:is_submission_required,true|string',
            'modules.*.file_type' => 'nullable|string|max:255',
            'modules.*.due_date' => 'required_if:is_submission_required,true|date|after:now',
            'modules.*.enable_comment' => 'nullable|boolean',
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

        $formattedDueDate = $request->due_date ? Carbon::parse($request->due_date)->format('Y-m-d H:i:s') : null;

        $module = Modules::create([
            'section_id' => $request->section_id,
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
            'is_submission_required' => $request->boolean('is_submission_required'),
            'due_date' => $formattedDueDate,
        ]);

        if ($request->boolean('is_submission_required') && is_array($request->modules)) {
            $moduleTitles = [];
            $points = [];
            $numOfAttempts = [];
            $submitTypes = [];
            $fileTypes = [];
            $dueDates = [];
            $enableComments = [];
            $submissionIndexes = [];

            foreach ($request->modules as $index => $subModule) {
                $moduleTitles[] = $subModule['module_title'];
                $points[] = $subModule['points'];
                $numOfAttempts[] = $subModule['num_of_attempts'];
                $submitTypes[] = $subModule['submit_type'];
                $fileTypes[] = !empty($subModule['file_type']) ? $subModule['file_type'] : 'text';
                $dueDates[] = isset($subModule['due_date']) ? Carbon::parse($subModule['due_date'])->format('Y-m-d H:i:s') : null;
                $enableComments[] = !empty($subModule['enable_comment']) ? 1 : 0;
                $submissionIndexes[] = $index + 1;
            }

            $module->update([
                'module_title' => implode(',', $moduleTitles),
                'points' => implode(',', $points),
                'num_of_attempts' => implode(',', $numOfAttempts),
                'submit_type' => implode(',', $submitTypes),
                'file_type' => implode(',', $fileTypes),
                'is_comment_enabled' => implode(',', $enableComments),
                'due_date' => implode(',', $dueDates),
                'submission_index' => implode(',', $submissionIndexes),
            ]);
        }

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');
        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Added Module: ' . $request->module_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Module added successfully!'
        ]);
    }

    public function get_module($id)
    {
        $module = Modules::find($id);

        if (!$module) {
            return response()->json([
                'message' => 'Module not found!'
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
            'module_file_desc' => 'nullable|string|max:255',
            'module_file' => 'nullable|array',
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt',
            'is_submission_required' => 'nullable|in:0,1,true,false',
            'modules' => 'required|array',
            'modules.*.module_title' => 'required_if:is_submission_required,true|string|max:255',
            'modules.*.points' => 'required_if:is_submission_required,true|integer|min:1',
            'modules.*.num_of_attempts' => 'required_if:is_submission_required,true|integer|min:1',
            'modules.*.submit_type' => 'required_if:is_submission_required,true|string',
            'modules.*.file_type' => 'nullable|string|max:255',
            'modules.*.due_date' => 'required_if:is_submission_required,true|date|after:now',
            'modules.*.enable_comment' => 'nullable|boolean',
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

        $moduleTitles = [];
        $points = [];
        $numOfAttempts = [];
        $submitTypes = [];
        $fileTypes = [];
        $dueDates = [];
        $enableComments = [];
        $submissionIndexes = [];

        if ($request->boolean('is_submission_required') && is_array($request->modules)) {
            foreach ($request->modules as $index => $subModule) {
                $moduleTitles[] = $subModule['module_title'];
                $points[] = $subModule['points'];
                $numOfAttempts[] = $subModule['num_of_attempts'];
                $submitTypes[] = $subModule['submit_type'];

                $fileTypes[] = !empty($subModule['file_type']) ? $subModule['file_type'] : 'text';
                $dueDates[] = isset($subModule['due_date']) ? Carbon::parse($subModule['due_date'])->format('Y-m-d H:i:s') : null;
                $enableComments[] = !empty($subModule['enable_comment']) ? 1 : 0;
                $submissionIndexes[] = $index + 1;
            }
        }

        $module->update([
            'section_id' => $request->section_id,
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
            'is_submission_required' => $request->boolean('is_submission_required'),
            'module_title' => implode(',', $moduleTitles),
            'points' => implode(',', $points),
            'num_of_attempts' => implode(',', $numOfAttempts),
            'submit_type' => implode(',', $submitTypes),
            'file_type' => implode(',', $fileTypes),
            'due_date' => implode(',', $dueDates),
            'is_comment_enabled' => implode(',', $enableComments),
            'submission_index' => implode(',', $submissionIndexes),
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Update Module: ' . $module->module_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Module updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $module = Modules::findOrFail($id);

        $module->delete();

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Delete Module: ' . $module->module_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Module deleted successfully!'
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

            $modules = DB::table('modules')
                ->where('section_id', $sectionId)
                ->get();

            $submissions = DB::table('module_submissions')
                ->whereIn('module_id', $modules->pluck('id'))
                ->select('module_id', 'student_id', 'submission_index')
                ->get();

            $result = $modules->map(function ($module) use ($submissions, $totalStudents) {
                $submissionIndexes = array_map('trim', explode(',', $module->submission_index));

                $totalStudentsList = [];
                $studentsSubmittedList = [];

                foreach ($submissionIndexes as $index) {
                    $totalStudentsList[] = $totalStudents;

                    $submittedCount = $submissions
                        ->where('module_id', $module->id)
                        ->where('submission_index', $index)
                        ->unique('student_id')
                        ->count();

                    $studentsSubmittedList[] = $submittedCount;
                }

                $module->total_students = implode(',', $totalStudentsList);
                $module->students_submitted = implode(',', $studentsSubmittedList);

                return $module;
            });

            return response()->json($result);
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
            'action' => 'Deleted Module file: "' . $deletedFileName . '"' . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Module file deleted successfully!'
        ]);
    }

    public function submit_answer(Request $request)
    {
        $request->validate([
            'module_id' => 'required|integer',
            'submission_index' => 'required|integer',
            'text_answer' => 'nullable|string',
            'module_file' => 'nullable|file',
            'comments' => 'nullable|string',
            'score' => 'nullable|integer',
            'total_attempts' => 'nullable|integer',
        ]);

        $studentId = Auth::user()->id;
        $moduleId = $request->input('module_id');
        $submissionIndex = $request->input('submission_index');

        $module = Modules::where('id', $moduleId)->first();
        if (!$module) {
            return response()->json(['message' => 'Module not found!'], 404);
        }

        $titles = explode(',', $module->module_title);
        $points = explode(',', $module->points);
        $attempts = explode(',', $module->num_of_attempts);
        $submitTypes = explode(',', $module->submit_type);
        $fileTypes = explode(',', $module->file_type);
        $dueDates = explode(',', $module->due_date);

        $selectedTitle = $titles[$submissionIndex - 1] ?? null;
        $selectedPoints = $points[$submissionIndex - 1] ?? null;
        $selectedAttempts = $attempts[$submissionIndex - 1] ?? null;
        $selectedSubmitType = $submitTypes[$submissionIndex - 1] ?? null;
        $selectedFileType = $fileTypes[$submissionIndex - 1] ?? null;
        $selectedDueDate = isset($dueDates[$submissionIndex - 1]) ? \Carbon\Carbon::parse($dueDates[$submissionIndex - 1]) : null;

        $numOfAttempts = $selectedAttempts;
        $currentDateTime = now();

        if ($selectedDueDate && $currentDateTime->greaterThan($selectedDueDate)) {
            return response()->json(['message' => 'The deadline for this module has passed!'], 403);
        }

        $existingAnswer = Answer::where('student_id', $studentId)
            ->where('module_id', $moduleId)
            ->where('submission_index', $submissionIndex)
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

        $allowedFileTypes = explode(',', $selectedFileType);
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

            if ($selectedFileType !== 'any' && !in_array($fileExtension, $allowedExtensions)) {
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
                'action' => "Resubmit Answer for {$selectedTitle} ({$ordinalAttempt} Attempt)",
                'created_at' => now()
            ]);

            return response()->json(['message' => 'Answer updated successfully!'], 200);
        } else {
            Answer::create([
                'student_id' => $studentId,
                'module_id' => $moduleId,
                'submission_index' => $submissionIndex,
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
                'ms.submission_index',
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
                'submission_index' => $submission->submission_index,
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
            'submission_index' => 'required|exists:module_submissions,submission_index',
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
            ->where('submission_index', $request->submission_index)
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

    public function getScore(Request $request)
    {
        $moduleId = $request->query('module_id');
        $submissionIndex = $request->query('submission_index');

        $submission = Answer::where('module_id', $moduleId)
            ->where('submission_index', $submissionIndex)
            ->first();

        $score = $submission ? $submission->score : 0;

        return response()->json(['score' => $score], 200);
    }
}
