<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Modules extends Model
{
    protected $table = 'modules';
    protected $fillable = ['section_id', 'module_name', 'module_desc', 'module_file_desc', 'file_name', 'file_path', 'is_submission_required', 'points', 'num_of_attempts', 'submit_type', 'file_type', 'is_comment_enabled', 'due_date'];
}
