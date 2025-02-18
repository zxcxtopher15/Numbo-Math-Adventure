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
}
