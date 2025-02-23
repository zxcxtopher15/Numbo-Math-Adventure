<?php

namespace App\Http\Controllers;

use App\Models\Modules;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'module_name' => 'required|string|max:255',
            'module_desc' => 'required|string|max:255',
            'module_file_desc' => 'required|string|max:255',
            'module_file' => 'required|array',
            'module_file.*' => 'mimes:jpeg,png,jpg,pdf,doc,docx,xls,xlsx,txt|max:10240',
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
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
        ]);

        return response()->json([
            'message' => 'Modules added successfully!'
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
            'module_name' => $request->module_name,
            'module_desc' => $request->module_desc,
            'module_file_desc' => $request->module_file_desc,
            'file_name' => implode(',', $fileNames),
            'file_path' => implode(',', $filePaths),
        ]);

        return response()->json([
            'message' => 'Module updated successfully!'
        ]);
    }

    public function destroy($id)
    {
        $module = Modules::findOrFail($id);

        $module->delete();

        return response()->json([
            'message' => 'Module deleted successfully!'
        ]);
    }

    public function get_modules()
    {
        $modules = Modules::all();

        return response()->json($modules);
    }

    public function destroy_single($id, $index)
    {
        $module = Modules::findOrFail($id);

        $fileNames = explode(',', $module->file_name);
        $filePaths = explode(',', $module->file_path);

        unset($fileNames[$index]);
        unset($filePaths[$index]);

        $fileNames = array_values($fileNames);
        $filePaths = array_values($filePaths);

        $module->file_name = implode(',', $fileNames);
        $module->file_path = implode(',', $filePaths);

        $module->save();

        return response()->json([
            'message' => 'Module deleted successfully!'
        ]);
    }
}
