<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderedQuestion extends Model
{
    use HasFactory;

    protected $table = 'ordered_questions';
    protected $fillable = ['math_jam_id', 'question_id', 'order_number'];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
