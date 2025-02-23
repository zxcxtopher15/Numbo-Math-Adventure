<?php

// app/Models/MathJamParticipant.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MathJamParticipant extends Model
{
    use HasFactory;

    protected $table = 'math_jam_participants';

    protected $fillable = [
        'math_jam_id',
        'student_id',
        'status',
        'score',
        'has_answer',
        'is_correct',
        'joined_at',
        'left_at'
    ];

    public function mathJam()
    {
        return $this->belongsTo(MathJam::class);
    }

    /**
     * Get the student (user) who joined the math jam.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function isStudent()
    {
        return $this->student->user_type === 'Student';
    }
}
