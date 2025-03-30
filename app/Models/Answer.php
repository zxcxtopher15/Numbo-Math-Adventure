<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $table = 'module_submissions';
    protected $fillable = ['student_id', 'module_id', 'text_answer', 'upload_file', 'comment', 'score', 'total_attempts'];
}
