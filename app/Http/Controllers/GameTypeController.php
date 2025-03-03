<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\GameType;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class GameTypeController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'game_type' => [
                'required',
                'string',
                Rule::unique('game_type', 'game_type_name')->where(function ($query) {
                    return $query->where('section_id', Auth::user()->section_id)
                        ->where('status', 0);
                }),
            ],
            'description' => 'required|string'
        ]);

        $gameType = GameType::create([
            'section_id' => Auth::user()->section_id,
            'game_type_name' => $request->game_type,
            'description' => $request->description,
            'status' => 1,
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Added Game Type: ' . $request->game_type . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Game Type added successfully',
            'data' => $gameType
        ], 201);
    }

    public function destroy(Request $request)
    {
        try {
            $gameType = GameType::find($request->game_type_id);

            if (!$gameType) {
                return response()->json([
                    'success' => false,
                    'message' => 'Game Type not found.'
                ], 404);
            }

            $gameType->delete();

            $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Deleted Game Type: ' . $gameType->game_type_name . ' for Section ' . $section_name,
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Game Type deleted successfully!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete Game Type.'
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $gameType = GameType::findOrFail($id);

            $gameType->status = $request->status;
            $gameType->save();

            return response()->json([
                'success' => true,
                'message' => 'Game type status updated successfully!',
                'status' => $gameType->status
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update game type status.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
