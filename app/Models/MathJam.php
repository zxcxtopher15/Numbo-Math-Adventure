<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MathJam extends Model
{
    use HasFactory;

    protected $fillable = [
        'math_jam_id',
        'math_jam_code',
        'teacher_id',
        'num_questions',
        'time_limit',
        'category',
        'show_scores',
        'status',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
