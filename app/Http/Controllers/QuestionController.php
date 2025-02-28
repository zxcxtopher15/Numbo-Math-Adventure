<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Section;
use App\Models\Question;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    public function index(): Response
    {
        $sectionId = Auth::user()->section_id;

        $questions = Question::where('status', 0)
            ->where('section_id', $sectionId)
            ->get();

        return Inertia::render('Teacher/Questions', [
            'questions' => $questions
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
}
