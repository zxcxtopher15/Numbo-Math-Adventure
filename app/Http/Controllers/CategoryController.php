<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Category;
use App\Models\GameType;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'game_type' => 'required|exists:game_type,id',
            'category' => [
                'required',
                'string',
                'max:255',
                Rule::unique('category', 'category_name')
                    ->where('section_id', Auth::user()->section_id)
                    ->where('status', 0),
            ],
            'description' => 'required|string',
            'example' => 'required|string'
        ]);

        $category = Category::create([
            'section_id' => Auth::user()->section_id,
            'game_type_id' => $request->game_type,
            'category_name' => $request->category,
            'description' => $request->description,
            'example' => $request->example
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');
        $game_type_name = GameType::where('id', $request->game_type)->value('game_type_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Added Category: ' . $request->category . ' in Game Type ' . $game_type_name . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category added successfully',
            'data' => $category
        ], 201);
    }

    public function destroy(Request $request)
    {
        try {
            $category = Category::find($request->category_id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found.'
                ], 404);
            }

            $category->status = 1;
            $category->save();

            $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');
            $game_type_name = GameType::where('id', $category->game_type_id)->value('game_type_name');

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Remove Category: ' . $request->category . ' in Game Type ' . $game_type_name . ' for Section ' . $section_name,
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete Category.'
            ], 500);
        }
    }
}
