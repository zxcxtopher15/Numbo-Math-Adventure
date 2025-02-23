<?php

namespace App\Http\Controllers;

use App\Models\MathJam;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\OrderedQuestion;
use App\Models\MathJamParticipant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MathJamController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'num_questions' => 'required|integer|min:1',
            'time_limit' => 'required|integer|min:10',
            'math_journey_for' => 'required|string',
            'category' => 'required|string',
            'show_scores' => 'required|boolean',
        ]);

        $existingJam = MathJam::where('teacher_id', $request->teacher_id)
            ->whereIn('status', ['waiting', 'started'])
            ->exists();

        if ($existingJam) {
            return response()->json([
                'message' => 'You already have an active Math Journey in progress.',
            ], 400);
        }

        do {
            $mathJamCode = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (MathJam::where('math_jam_code', $mathJamCode)->exists());

        $mathJam = MathJam::create([
            'math_jam_id' => $request->math_jam_id,
            'math_jam_code' => $mathJamCode,
            'teacher_id' => $request->teacher_id,
            'num_questions' => $request->num_questions,
            'time_limit' => $request->time_limit,
            'math_journey_for' => $request->math_journey_for,
            'category' => $request->category,
            'show_scores' => $request->show_scores,
            'status' => 'waiting',
        ]);

        return response()->json([
            'message' => 'Math Journey created successfully!',
            'jam' => $mathJam,
        ]);
    }

    public function checkExistingJam(Request $request)
    {
        $teacherId = $request->query('teacher_id');

        $existingJam = MathJam::where('teacher_id', $teacherId)
            ->whereIn('status', ['waiting', 'started', 'disconnected'])
            ->first();

        if ($existingJam) {
            $hasQuestions = OrderedQuestion::where('math_jam_id', $existingJam->math_jam_id)->exists();

            if ($hasQuestions) {
                return response()->json([
                    'jam' => $existingJam,
                    'hasQuestions' => true
                ]);
            } else {
                return response()->json([
                    'jam' => $existingJam,
                    'hasQuestions' => false
                ]);
            }
        }

        return response()->json([
            'jam' => null,
            'message' => 'No existing math jam found.'
        ]);
    }

    public function streamMathJamParticipants(Request $request)
    {
        header("Content-Type: text/event-stream");
        header("Cache-Control: no-cache");
        header("Connection: keep-alive");

        $teacherId = $request->query('teacher_id');
        $lastUpdatedAt = null;

        while (!connection_aborted()) {
            $jam = MathJam::where('teacher_id', $teacherId)->latest()->first();

            if ($jam) {
                $latestUpdate = DB::table('math_jam_participants')
                    ->where('math_jam_id', $jam->id)
                    ->max('updated_at');

                $participants = DB::table('math_jam_participants')
                    ->join('users', 'math_jam_participants.student_id', '=', 'users.id')
                    ->where('math_jam_participants.math_jam_id', $jam->id)
                    ->select('math_jam_participants.*', 'users.name')
                    ->get();

                echo "data: " . json_encode($participants) . "\n\n";
                $lastUpdatedAt = $latestUpdate;
            } else {
                echo "data: []\n\n";
            }

            ob_flush();
            flush();
            usleep(5000);
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
            'message' => 'Math Journey has been cancelled.',
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
            return response()->json(['message' => 'Invalid Math Journey Code'], 200);
        }

        switch ($mathJam->status) {
            case 'started':
                return response()->json(['message' => 'The Math Journey has already started.'], 200);

            case 'cancelled':
                return response()->json(['message' => 'The Math Journey has been cancelled.'], 200);

            case 'disconnected':
                return response()->json(['message' => 'The Math Journey host has been disconnected.'], 200);

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
                return response()->json(['message' => 'The Math Journey has already ended.'], 200);

            default:
                return response()->json(['message' => 'Unexpected Math Journey status.'], 200);
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
                return response()->json(['message' => 'No valid Math Journey found', 'error' => true], 200);
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
            'participant' => $participant,
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
                'message' => "Current Math Journey " . ucfirst($mathJam->status)
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
            'updated_at' => now(),
            'disconnected_at' => null,
        ]);

        return response()->json([
            'jam' => $mathJam,
            'message' => 'Reconnected successfully',
            'score' => $participant->score,
            'status' => 'joined',
        ]);
    }

    public function jamStreamUpdates(Request $request)
    {
        $mathJamCode = $request->query('math_jam_code');

        $mathJam = MathJam::where('math_jam_code', $mathJamCode)->first();
        $lastUpdatedAt = $mathJam ? $mathJam->updated_at : null;

        return response()->stream(function () use ($mathJamCode, &$lastUpdatedAt) {
            while (!connection_aborted()) {
                $mathJam = MathJam::where('math_jam_code', $mathJamCode)->first();

                if ($mathJam) {
                    if ($mathJam->updated_at != $lastUpdatedAt) {
                        echo "data: " . json_encode($mathJam) . "\n\n";
                        $lastUpdatedAt = $mathJam->updated_at;
                    }
                }

                ob_flush();
                flush();
                usleep(100000);
            }
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
        ]);
    }

    public function update_status(Request $request)
    {
        $mathJam = MathJam::where('math_jam_id', $request->math_jam_id)->first();

        $mathJam->update([
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Update successful',
        ]);
    }

    public function saveOrderedQuestions(Request $request)
    {
        if (!$request->has('questions') || !is_array($request->input('questions'))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid data provided',
                'data_received' => $request->all()
            ], 400);
        }

        $questions = $request->input('questions');

        foreach ($questions as $question) {
            $exists = OrderedQuestion::where('math_jam_id', $question['math_jam_id'])
                ->where('question_id', $question['question_id'])
                ->exists();

            if (!$exists) {
                OrderedQuestion::create([
                    'math_jam_id'  => $question['math_jam_id'],
                    'question_id'  => $question['question_id'],
                    'order_number' => $question['order_number'],
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Questions saved successfully'
        ]);
    }

    public function getOrderedQuestions(Request $request)
    {
        $mathJamId = $request->query('math_jam_id');

        if (!$mathJamId) {
            return response()->json(['status' => 'error', 'message' => 'Missing math_jam_id'], 400);
        }

        $questions = OrderedQuestion::where('math_jam_id', $mathJamId)
            ->orderBy('order_number')
            ->with('question')
            ->get();

        return response()->json($questions);
    }

    public function destroy($id)
    {
        $orderedQuestion = OrderedQuestion::where('question_id', $id)->first();

        if ($orderedQuestion) {
            $orderedQuestion->delete();
            return response()->json(['message' => 'Question removed successfully'], 200);
        }

        return response()->json(['message' => 'Question not found'], 404);
    }

    public function disconnect_jam(Request $request)
    {
        $validated = $request->validate([
            'math_jam_id' => 'required|exists:math_jams,math_jam_id',
        ]);

        $mathJam = MathJam::where('math_jam_id', $validated['math_jam_id'])->first();

        if ($mathJam) {
            $mathJam->status = 'disconnected';
            $mathJam->updated_at = now();
            $mathJam->save();

            return response()->json([
                'jam' => $mathJam,
                'message' => 'MathJam disconnected successfully',
            ]);
        }

        return response()->json(['message' => 'MathJam not found', 'error' => true], 404);
    }

    public function updatePauseStatus(Request $request)
    {
        $status = $request->input('is_paused');

        $mathJam = MathJam::where('math_jam_id', $request->math_jam_id)->first();

        if (!$mathJam) {
            return response()->json(['message' => 'Math Jam not found'], 404);
        }

        $mathJam->is_paused = $status;
        $mathJam->updated_at = now();
        $mathJam->save();

        return response()->json(['message' => 'Math Jam paused successfully'], 200);
    }

    public function update_current_question(Request $request)
    {
        $current_question_id = $request->input('current_question_id');

        $mathJam = MathJam::where('math_jam_id', $request->math_jam_id)->first();

        if (!$mathJam) {
            return response()->json(['message' => 'Math Jam not found'], 404);
        }

        $mathJam->current_question_id = $current_question_id;
        $mathJam->updated_at = now();
        $mathJam->save();

        return response()->json(['message' => 'Math Jam current question updated successfully'], 200);
    }

    public function update_is_correct(Request $request)
    {
        $validated = $request->validate([
            'math_jam_code' => 'required|exists:math_jams,math_jam_code',
            'student_id' => 'required|exists:users,id',
        ]);

        $participant = MathJamParticipant::where('student_id', $validated['student_id'])
            ->whereHas('MathJam', function ($query) use ($validated) {
                $query->where('math_jam_code', $validated['math_jam_code']);
                $query->whereNotIn('status', ['cancelled', 'ended', 'disconnected']);
            })
            ->whereNotNull('math_jam_id')
            ->latest()
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'No active participation found', 'error' => true], 200);
        }

        $participant->is_correct = 1;
        $participant->updated_at = now();
        $participant->save();

        return response()->json([
            'message' => 'Updated successfully',
            'new_score' => $participant->score
        ]);
    }

    public function update_has_answer(Request $request)
    {
        $validated = $request->validate([
            'math_jam_code' => 'required|exists:math_jams,math_jam_code',
            'student_id' => 'required|exists:users,id',
        ]);

        $participant = MathJamParticipant::where('student_id', $validated['student_id'])
            ->whereHas('MathJam', function ($query) use ($validated) {
                $query->where('math_jam_code', $validated['math_jam_code']);
                $query->whereNotIn('status', ['cancelled', 'ended', 'disconnected']);
            })
            ->whereNotNull('math_jam_id')
            ->latest()
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'No active participation found', 'error' => true], 200);
        }

        $participant->has_answer = $request->has_answer;
        $participant->save();
        $participant->touch();

        return response()->json([
            'message' => 'Updated successfully',
            'new_score' => $participant->score
        ]);
    }

    public function getStudentResults()
    {
        $rawData = DB::table('users')
            ->join('math_jam_participants', 'users.id', '=', 'math_jam_participants.student_id')
            ->join('math_jams', 'math_jam_participants.math_jam_id', '=', 'math_jams.id')
            ->select(
                'users.name',
                'math_jams.math_journey_for',
                'math_jams.category',
                'math_jam_participants.score',
                'math_jams.num_questions',
                'math_jam_participants.created_at as date'
            )
            ->get();

        $formattedData = [];

        foreach ($rawData as $entry) {
            $studentName = $entry->name;

            if (!isset($formattedData[$studentName])) {
                $formattedData[$studentName] = [
                    'name' => $studentName,
                    'scores' => [],
                ];
            }

            $formattedData[$studentName]['scores'][] = [
                'math_journey_for' => $entry->math_journey_for,
                'category' => $entry->category,
                'score' => $entry->score,
                'num_questions' => $entry->num_questions,
                'date' => $entry->date,
            ];
        }

        return response()->json(['results' => array_values($formattedData)]);
    }

    public function update_answers(Request $request)
    {
        $request->validate([
            'math_jam_code' => 'required|string|exists:math_jams,math_jam_code',
        ]);

        try {
            $mathJam = MathJam::where('math_jam_code', $request->math_jam_code)->first();

            if (!$mathJam) {
                return response()->json(['error' => 'MathJam not found'], 404);
            }

            $updated = MathJamParticipant::where('math_jam_id', $mathJam->id)
                ->update([
                    'has_answer' => 0,
                    'updated_at' => now(),
                ]);

            $mathJam->update([
                'is_paused' => 0,
                'updated_at' => now(),
            ]);

            if ($updated) {
                return response()->json(['message' => 'Has Answer updated successfully'], 200);
            } else {
                return response()->json(['error' => 'No records updated'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong', 'details' => $e->getMessage()], 500);
        }
    }

    public function update_score(Request $request)
    {
        $validated = $request->validate([
            'math_jam_code' => 'required|exists:math_jams,math_jam_code',
        ]);

        $participants = MathJamParticipant::whereHas('MathJam', function ($query) use ($validated) {
            $query->where('math_jam_code', $validated['math_jam_code'])
                ->whereNotIn('status', ['cancelled', 'ended', 'disconnected']);
        })
            ->whereNotNull('math_jam_id')
            ->where('is_correct', 1)
            ->get();

        if ($participants->isEmpty()) {
            return response()->json(['message' => 'No eligible participants found for score update', 'error' => true], 200);
        }

        foreach ($participants as $participant) {
            $participant->increment('score');
            $participant->is_correct = 0;
            $participant->updated_at = now();
            $participant->save();
        }

        return response()->json([
            'message' => 'Scores updated successfully',
            'updated_count' => $participants->count()
        ]);
    }

    public function exit_jam(Request $request)
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

        $participant->delete();

        return response()->json([
            'message' => 'Participant removed successfully',
        ]);
    }

    public function getStudentResultsParent()
    {
        $studentIds = DB::table('parent_student_relation')
            ->where('parent_id', Auth::id())
            ->pluck('student_id');

        if ($studentIds->isEmpty()) {
            return response()->json(['results' => []]);
        }

        $rawData = DB::table('users')
            ->join('math_jam_participants', 'users.id', '=', 'math_jam_participants.student_id')
            ->join('math_jams', 'math_jam_participants.math_jam_id', '=', 'math_jams.id')
            ->whereIn('math_jam_participants.student_id', $studentIds)
            ->select(
                'users.name',
                'math_jams.math_journey_for',
                'math_jams.category',
                'math_jam_participants.score',
                'math_jams.num_questions',
                'math_jam_participants.created_at as date'
            )
            ->get();

        $formattedData = [];

        foreach ($rawData as $entry) {
            $studentName = $entry->name;

            if (!isset($formattedData[$studentName])) {
                $formattedData[$studentName] = [
                    'name' => $studentName,
                    'scores' => [],
                ];
            }

            $formattedData[$studentName]['scores'][] = [
                'math_journey_for' => $entry->math_journey_for,
                'category' => $entry->category,
                'score' => $entry->score,
                'num_questions' => $entry->num_questions,
                'date' => $entry->date,
            ];
        }

        return response()->json(['results' => array_values($formattedData)]);
    }
}
