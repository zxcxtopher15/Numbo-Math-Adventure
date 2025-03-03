<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Section;
use App\Models\Category;
use App\Models\GameType;
use App\Models\Question;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    public function index(): Response
    {
        $sectionId = Auth::user()->section_id;

        $questions = Question::where('questions.status', 0)
            ->where('questions.section_id', $sectionId)
            ->join('category', 'category.category_name', '=', 'questions.category')
            ->where('category.status', 0)
            ->select('questions.*')
            ->groupBy('questions.id')
            ->get();

        $gameTypes = GameType::where('section_id', $sectionId)
            ->get()
            ->map(function ($gameType) {
                return [
                    'game_type_id' => $gameType->id,
                    'type' => $gameType->game_type_name,
                    'status' => $gameType->status,
                ];
            })->toArray();

        $categories = Category::where('category.status', 0)
            ->where('category.section_id', $sectionId)
            ->leftJoin('game_type', 'game_type.id', '=', 'category.game_type_id')
            ->select(
                'category.id as category_id',
                'category.category_name as category',
                'game_type.game_type_name as type',
                'category.game_type_id as game_type_id'
            )
            ->get()
            ->toArray();

        return Inertia::render('Teacher/Questions', [
            'questions' => $questions,
            'gameTypes' => $gameTypes,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'category' => 'required|string',
            'question' => 'required|string',
            'choices' => 'required|array|max:4',
            'correct_answer' => 'required|string',
        ]);

        Question::create($request->all());

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Added Question: ' . $request->question . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return redirect()->route('questions')->with('success', 'Question added successfully.');
    }

    public function getQuestions(Request $request)
    {
        $sectionId = Auth::user()->section_id;

        $categoryTitle = $request->query('categoryTitle');
        $num_questions = $request->query('num_questions');

        $categories = is_array(json_decode($categoryTitle)) ? json_decode($categoryTitle) : [$categoryTitle];

        $questions = [];

        if ($num_questions) {
            $questionsPerCategory = floor($num_questions / count($categories));
            $remainingQuestions = $num_questions;
        } else {
            $questionsPerCategory = floor(20 / count($categories));
            $remainingQuestions = 20;
        }

        $allFetchedQuestions = [];

        $categoryQuestions = [];
        foreach ($categories as $category) {
            $categoryQuestions[$category] = Question::where('category', $category)
                ->where('status', 0)
                ->where('section_id', $sectionId)
                ->inRandomOrder()
                ->limit($questionsPerCategory)
                ->get();

            $allFetchedQuestions = array_merge($allFetchedQuestions, $categoryQuestions[$category]->toArray());

            $remainingQuestions -= $categoryQuestions[$category]->count();
        }

        if ($remainingQuestions > 0) {
            foreach ($categories as $category) {

                if ($remainingQuestions > 0) {
                    $additionalQuestions = Question::where('category', $category)
                        ->where('status', 0)
                        ->where('section_id', $sectionId)
                        ->whereNotIn('id', array_column($allFetchedQuestions, 'id'))
                        ->inRandomOrder()
                        ->limit($remainingQuestions)
                        ->get();

                    $categoryQuestions[$category] = $categoryQuestions[$category]->merge($additionalQuestions);

                    $allFetchedQuestions = array_merge($allFetchedQuestions, $additionalQuestions->toArray());

                    $remainingQuestions -= $additionalQuestions->count();
                }
            }
        }

        foreach ($categoryQuestions as $category => $questionsData) {
            $questions = array_merge($questions, $questionsData->toArray());
        }

        return response()->json($questions);
    }

    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $question->status = 1;
        $question->save();

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Remove Question: ' . $question->question . ' for Section ' . $section_name,
            'created_at' => now()
        ]);

        return response()->json(['message' => 'Question status updated successfully.']);
    }

    public function getQuestion($id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json(["message" => "Question not found"], 404);
        }

        return response()->json($question);
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = Question::find($id);
        if (!$question) {
            return response()->json(['message' => 'Question not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'section_id'      => 'required|exists:sections,id',
            'category'        => 'required|string',
            'question'        => 'required|string',
            'choices'         => 'required|array|max:4',
            'correct_answer'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $question_edited = $question->question !== $request->question;

        $question->update([
            'category'       => $request->category,
            'question'       => $request->question,
            'choices'        => $request->choices,
            'correct_answer' => $request->correct_answer,
        ]);

        $section_name = Section::where('id', Auth::user()->section_id)->value('section_name');

        $action_message = $question_edited
            ? 'Update Question: ' . $question->question . ' for Section ' . $section_name . ' to ' . $request->question
            : 'Updated Question: ' . $question->question . ' for Section ' . $section_name;

        AuditTrail::create([
            'user_id'    => Auth::user()->id,
            'action'     => $action_message,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Question updated successfully.'], 200);
    }
}
