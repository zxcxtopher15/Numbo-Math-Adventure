<?php

namespace App\Http\Controllers;

use App\Models\Modules;
use App\Models\Section;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
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
            'module_file' => 'required|array',
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt',
        ]);

        $filePaths = [];
        $fileNames = [];

        foreach ($request->file('module_file') as $file) {
            $fileNameWithoutExtension = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $fileExtension = $file->getClientOriginalExtension();
            $fileName = $fileNameWithoutExtension;
            $filePath = $fileNameWithoutExtension . '.' . $fileExtension;

            $file->move(public_path('modules'), $filePath);

            $filePaths[] = $filePath;
            $fileNames[] = $fileName;
        }

        Modules::create([
            'section_id' => $request->section_id,
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Added Announcement: ' . $request->mdule_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Announcements added successfully!'
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
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt|max:10240',
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

        $module->update([
            'section_id' => $request->section_id,
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
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
            $student_ids = ParentStudentRelationship::join('users', 'users.id', '=', 'parent_student_relationship.student_id')
                ->where('parent_student_relationship.status', 0)
                ->where('users.status', 0)
                ->where('parent_student_relationship.parent_id', Auth::user()->id)
                ->pluck('parent_student_relationship.student_id');

            echo '<pre>';
            print_r($student_ids);
            exit;

            $section_ids = User::whereIn('id', $student_ids)->pluck('section_id');

            $modules = Modules::whereIn('section_id', $section_ids)->get();
        } else {
            $sectionId = Auth::user()->section_id;

            $modules = Modules::where('section_id', $sectionId)->get();

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
}
