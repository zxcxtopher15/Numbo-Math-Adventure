<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Section;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Auth;

class SectionController extends Controller
{
    public function index()
    {
        $unassigned = User::where('user_type', 'Teacher')
            ->where('section_id', 0)
            ->where('status', 0)
            ->get(['id', 'name']);

        $assigned = Section::leftJoin('users', 'sections.id', '=', 'users.section_id')
            ->where('sections.status', 0)
            ->where(function ($query) {
                $query->where('users.user_type', 'Teacher')
                    ->where('users.status', 0)
                    ->orWhereNull('users.id');
            })
            ->select([
                'users.id',
                'sections.id as section_id',
                'sections.section_name',
                DB::raw('COALESCE(users.name, "") AS name')
            ])
            ->get();

        return Inertia::render('Admin/Sections', [
            'unassignedTeachers' => $unassigned,
            'assignedTeachers' => $assigned
        ]);
    }

    public function teacher_index()
    {
        $sections = Section::where('status', 0)->get();
        $unassigned = User::where('user_type', 'Student')
            ->where('section_id', 0)
            ->where('status', 0)
            ->get(['id', 'name']);

        $assigned = Section::leftJoin('users', 'sections.id', '=', 'users.section_id')
            ->where('sections.status', 0)
            ->where(function ($query) {
                $query->where('users.user_type', 'Student')
                    ->where('users.status', 0)
                    ->orWhereNull('users.id');
            })
            ->select([
                'users.id',
                DB::raw('COALESCE(users.name, "") AS name'),
                'sections.section_name',
                'sections.id AS section_id'
            ])
            ->whereNotNull('users.id')
            ->get();


        $sectionData = [
            'students' => $assigned->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'section_id' => $student->section_id,
                    'section_name' => $student->section_name,
                ];
            })->toArray(),
        ];

        return Inertia::render('Teacher/Sections', [
            'allStudents' => $unassigned,
            'sectionData' => $sectionData,
            'sections' => $sections
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'section_name' => 'required|string|max:255',
        ]);

        $existingSection = Section::where('section_name', $request->section_name)
            ->where('status', 0)
            ->exists();

        if ($existingSection) {
            return response()->json(['message' => 'Section name already exists'], 422);
        }

        Section::create([
            'section_name' => $request->section_name,
            'status' => 0,
        ]);

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Add Section: ' . $request->section_name,
            'created_at' => now()
        ]);

        return response()->json(['message' => 'Section created successfully'], 201);
    }

    public function destroy(Request $request)
    {
        $section = Section::find($request->sectionId);

        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        $section->status = 1;
        $section->save();

        DB::table('users')
            ->where('section_id', $request->sectionId)
            ->update(['section_id' => 0]);

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Delete Section: ' . $section->section_name,
            'created_at' => now()
        ]);

        return response()->json(['message' => 'Section deactivated and students updated successfully']);
    }


    public function assignTeacher(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $teacher = User::find($request->teacher_id);
        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found.'], 404);
        }

        $teacher->section_id = $request->section_id;
        $teacher->save();

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Assign Teacher: ' . $teacher->name . ' to Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Teacher successfully assigned to section.',
            'teacher' => $teacher
        ], 200);
    }

    public function unassignTeacher(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);

        $teacher = User::find($request->teacher_id);

        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found.'], 404);
        }

        $teacher->section_id = 0;
        $teacher->save();

        $section_name = Section::where('id', $teacher->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Assign Teacher: ' . $teacher->name . ' to Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Teacher unassigned to section.',
            'teacher' => $teacher
        ], 200);
    }

    public function removeFromSection(Request $request)
    {
        $studentId = $request->input('student_id');

        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Invalid student ID'], 400);
        }

        $student = User::where('id', $studentId)->first();

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }

        $section_id = User::where('id', $studentId)->value('section_id');
        $section_name = Section::where('id', $section_id)->value('section_name');

        $student->section_id = 0;
        $student->save();

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Remove Student: ' . $student->name . ' from Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json(['success' => true, 'message' => 'Student removed from section']);
    }

    public function addToSection(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'integer|exists:users,id',
        ]);

        $section_id = Auth::user()->section_id;

        if (!$section_id) {
            return response()->json(['success' => false, 'message' => 'You are not assigned to any section.'], 403);
        }

        try {
            $section_name = Section::where('id', $section_id)->value('section_name');

            $students = User::whereIn('id', $request->student_ids)->get();

            foreach ($students as $student) {
                $student->forceFill(['section_id' => $section_id])->save();

                AuditTrail::create([
                    'user_id' => Auth::user()->id,
                    'action' => 'Added Student: ' . $student->name . ' to Section: ' . $section_name,
                    'created_at' => now()
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Students added to your section successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add students to section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function admin_index()
    {
        $sections = Section::where('status', 0)->get();
        $unassigned = User::where('user_type', 'Student')
            ->where('section_id', 0)
            ->where('status', 0)
            ->get(['id', 'name']);

        $assigned = Section::leftJoin('users', 'sections.id', '=', 'users.section_id')
            ->where('sections.status', 0)
            ->where(function ($query) {
                $query->where('users.user_type', 'Student')
                    ->where('users.status', 0)
                    ->orWhereNull('users.id');
            })
            ->select([
                'users.id',
                DB::raw('COALESCE(users.name, "") AS name'),
                'sections.section_name',
                'sections.id AS section_id'
            ])
            ->whereNotNull('users.id')
            ->get();


        $sectionData = [
            'students' => $assigned->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'section_id' => $student->section_id,
                    'section_name' => $student->section_name,
                ];
            })->toArray(),
        ];

        return Inertia::render('Admin/AssignStudents', [
            'allStudents' => $unassigned,
            'sectionData' => $sectionData,
            'sections' => $sections
        ]);
    }

    public function addToSectionAdmin(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'integer|exists:users,id',
            'section' => 'integer|exists:sections,id'
        ]);

        $section_id = $request->section;

        if (!$section_id) {
            return response()->json(['success' => false, 'message' => 'You are not assigned to any section.'], 403);
        }

        try {
            $section_name = Section::where('id', $section_id)->value('section_name');

            $students = User::whereIn('id', $request->student_ids)->get();

            foreach ($students as $student) {
                $student->forceFill(['section_id' => $section_id])->save();

                AuditTrail::create([
                    'user_id' => Auth::user()->id,
                    'action' => 'Added Student: ' . $student->name . ' to Section: ' . $section_name,
                    'created_at' => now()
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Students added to the section successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add students to section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeFromSectionAdmin(Request $request)
    {
        $studentId = $request->input('student_id');

        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Invalid student ID'], 400);
        }

        $student = User::where('id', $studentId)->first();

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }

        $section_id = User::where('id', $studentId)->value('section_id');
        $section_name = Section::where('id', $section_id)->value('section_name');

        $student->section_id = 0;
        $student->save();

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Remove Student: ' . $student->name . ' from Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json(['success' => true, 'message' => 'Student removed from section']);
    }
}
