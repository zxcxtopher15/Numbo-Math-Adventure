<?php

namespace App\Http\Controllers;

use App\Models\MathJam;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\MathJamParticipant;
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

    public function cancelJam(Request $request)
    {
        $jamId = $request->jam_id;
        $jam = MathJam::findOrFail($jamId);

        if ($jam->teacher_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        $jam->status = 'cancelled';
        $jam->save();

        return response()->json([
            'message' => 'Math Jam has been cancelled.',
            'jam' => $jam,
        ]);
    }

    public function joinJam(Request $request)
    {
        $validated = $request->validate([
            'math_jam_code' => 'required|string',
            'student_id' => 'required|exists:users,id',
        ]);

        $mathJam = MathJam::where('math_jam_code', $validated['math_jam_code'])->first();

        if (!$mathJam) {
            return response()->json(['message' => 'Invalid Math Jam Code'], 200);
        }

        switch ($mathJam->status) {
            case 'started':
                return response()->json(['message' => 'The Math Jam has already started.'], 200);

            case 'cancelled':
                return response()->json(['message' => 'The Math Jam has been cancelled.'], 200);

            case 'waiting':
                $existingParticipant = MathJamParticipant::where('math_jam_id', $mathJam->id)
                    ->where('student_id', $validated['student_id'])
                    ->first();

                if ($existingParticipant) {
                    return response()->json([
                        'status' => $existingParticipant->status,
                        'score' => $existingParticipant->score,
                    ]);
                }

                $participant = MathJamParticipant::create([
                    'math_jam_id' => $mathJam->id,
                    'student_id' => $validated['student_id'],
                    'status' => 'joined',
                    'score' => 0,
                    'joined_at' => now(),
                ]);

                return response()->json([
                    'status' => 'joined',
                    'score' => 0,
                ]);

            case 'ended':
                return response()->json(['message' => 'The Math Jam has already ended.'], 200);

            default:
                return response()->json(['message' => 'Unexpected Math Jam status.'], 200);
        }
    }

    public function checkStatus(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'math_jam_code' => 'nullable|string',
        ]);

        if (empty($validated['math_jam_code'])) {
            $latestParticipant = MathJamParticipant::where('student_id', $validated['student_id'])
                ->latest()
                ->first();

            if (!$latestParticipant) {
                return response()->json(['message' => 'No participation record found', 'error' => true], 200);
            }

            $validated['math_jam_code'] = $latestParticipant->mathJam->math_jam_code ?? null;

            if (!$validated['math_jam_code']) {
                return response()->json(['message' => 'No valid Math Jam found', 'error' => true], 200);
            }
        }

        $mathJamCode = $validated['math_jam_code'];

        $participant = MathJamParticipant::where('student_id', $validated['student_id'])
            ->whereHas('MathJam', function ($query) use ($mathJamCode) {
                $query->where('math_jam_code', $mathJamCode);
                $query->whereNotIn('status', ['cancelled', 'ended']);
            })
            ->latest()
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'No active participation found', 'error' => true], 200);
        }

        return response()->json([
            'math_jam_code' => $mathJamCode,
            'status' => $participant->status,
            'score' => $participant->score,
            'error' => false
        ]);
    }

    public function disconnect(Request $request)
    {
        $validated = $request->validate([
            'math_jam_code' => 'required|exists:math_jams,math_jam_code',
            'student_id' => 'required|exists:users,id',
        ]);

        $participant = MathJamParticipant::where('student_id', $validated['student_id'])
            ->whereHas('MathJam', function ($query) use ($validated) {
                $query->where('math_jam_code', $validated['math_jam_code']);
                $query->whereNotIn('status', ['cancelled', 'ended']);
            })
            ->whereNotNull('math_jam_id')
            ->latest()
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'No active participation found', 'error' => true], 200);
        }

        $participant->disconnected_at = now();
        $participant->status = 'disconnected';
        $participant->save();

        return response()->json([
            'message' => 'Disconnected successfully',
        ]);
    }

    public function reconnect(Request $request)
    {
        $validated = $request->validate([
            'math_jam_code' => 'required|exists:math_jams,math_jam_code',
            'student_id' => 'required|exists:users,id',
        ]);

        $mathJam = MathJam::where('math_jam_code', $validated['math_jam_code'])->first();

        if (!$mathJam || in_array($mathJam->status, ['cancelled', 'ended'])) {
            return response()->json([
                'message' => "Current Math Jam " . ucfirst($mathJam->status)
            ], 400);
        }

        $participant = MathJamParticipant::where('student_id', $validated['student_id'])
            ->where('status', 'disconnected')
            ->whereHas('MathJam', function ($query) use ($validated) {
                $query->where('math_jam_code', $validated['math_jam_code']);
            })
            ->latest()
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'No disconnected participation found'], 404);
        }

        $participant->update([
            'status' => 'joined',
            'disconnected_at' => null,
        ]);

        return response()->json([
            'message' => 'Reconnected successfully',
            'score' => $participant->score,
            'status' => 'joined',
        ]);
    }

    public function jamStreamUpdates(Request $request)
    {
        $mathJamCode = $request->query('math_jam_code');

        return response()->stream(function () use ($mathJamCode) {
            while (true) {
                $mathJam = MathJam::where('math_jam_code', $mathJamCode)->first();

                if ($mathJam) {
                    echo "data: " . json_encode($mathJam) . "\n\n";
                }

                ob_flush();
                flush();
                sleep(.1000);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }
}
