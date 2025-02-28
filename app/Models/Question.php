<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = ['section_id','category', 'question', 'choices', 'correct_answer'];

    protected $casts = [
        'choices' => 'array',
    ];
}
