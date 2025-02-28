<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\User;

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

        if (!is_null($request->id)) {
            DB::table('users')
                ->where('id', $request->id)
                ->update(['section_id' => 0]);
        }

        return response()->json(['message' => 'Section deactivated successfully']);
    }

    public function assignTeacher(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $teacher = User::find($request->teacher_id);

        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found.'], 404);
        }

        $teacher->section_id = $request->section_id;
        $teacher->save();

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

        return response()->json([
            'message' => 'Teacher unassigned to section.',
            'teacher' => $teacher
        ], 200);
    }
}
