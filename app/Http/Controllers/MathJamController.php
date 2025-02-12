<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MathJam;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class MathJamController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'num_questions' => 'required|integer|min:1',
            'time_limit' => 'required|integer|min:10',
            'category' => 'required|string',
            'show_scores' => 'required|boolean',
        ]);

        $existingJam = MathJam::where('teacher_id', $request->teacher_id)
            ->whereIn('status', ['waiting', 'started'])
            ->exists();

        if ($existingJam) {
            return response()->json([
                'message' => 'You already have an active Math Jam in progress.',
            ], 400);
        }

        do {
            $mathJamCode = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (MathJam::where('math_jam_code', $mathJamCode)->exists());

        $mathJam = MathJam::create([
            'math_jam_id' => Str::uuid(),
            'math_jam_code' => $mathJamCode,
            'teacher_id' => $request->teacher_id,
            'num_questions' => $request->num_questions,
            'time_limit' => $request->time_limit,
            'category' => $request->category,
            'show_scores' => $request->show_scores,
            'status' => 'waiting',
        ]);

        return response()->json([
            'message' => 'Math Jam created successfully!',
            'jam' => $mathJam,
        ]);
    }

    public function checkExistingJam(Request $request)
    {
        $teacherId = $request->query('teacher_id');

        $existingJam = MathJam::where('teacher_id', $teacherId)
            ->whereIn('status', ['waiting', 'started'])
            ->first();

        return response()->json(['jam' => $existingJam]);
    }

    public function streamMathJamUpdates(Request $request)
    {
        header("Content-Type: text/event-stream");
        header("Cache-Control: no-cache");
        header("Connection: keep-alive");

        $teacherId = $request->query('teacher_id');

        while (true) {
            $jam = MathJam::where('teacher_id', $teacherId)->latest()->first();

            echo "data: " . json_encode($jam) . "\n\n";
            ob_flush();
            flush();

            sleep(.100);
        }
    }
}
