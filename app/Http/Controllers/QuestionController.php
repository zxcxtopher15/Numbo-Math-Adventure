<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(): Response
    {
        $questions = Question::all();

        return Inertia::render('Teacher/Questions', [
            'questions' => $questions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'question' => 'required|string',
            'choices' => 'required|array|max:4',
            'correct_answer' => 'required|string',
        ]);

        Question::create($request->all());

        return redirect()->route('questions')->with('success', 'Question added successfully.');
    }

    public function getQuestions(Request $request)
    {
        $categoryTitle = $request->query('categoryTitle');

        $categories = is_array(json_decode($categoryTitle)) ? json_decode($categoryTitle) : [$categoryTitle];

        $questions = [];

        if ($request->num_questions) {
            $questionsPerCategory = floor($request->num_questions / count($categories));
            $remainingQuestions = $request->num_questions;
        } else {
            $questionsPerCategory = floor(20 / count($categories));
            $remainingQuestions = 20;
        }

        $allFetchedQuestions = [];

        $categoryQuestions = [];
        foreach ($categories as $category) {
            $categoryQuestions[$category] = Question::where('category', $category)
                ->where('status', 0)
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
}
