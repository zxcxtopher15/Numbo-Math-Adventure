<?php

namespace App\Http\Controllers;

use App\Models\GameType;
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
                    return $query->where('section_id', Auth::user()->section_id);
                }),
            ],
        ]);

        $gameType = GameType::create([
            'section_id' => Auth::user()->section_id,
            'game_type_name' => $request->game_type
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Game Type added successfully',
            'data' => $gameType
        ], 201);
    }
}
