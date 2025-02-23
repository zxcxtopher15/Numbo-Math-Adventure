<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParentStudentRelationship extends Model
{
    protected $table = 'parent_student_relation';
    protected $fillable = ['id', 'parent_id', 'student_id'];
}
