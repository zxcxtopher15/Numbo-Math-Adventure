<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Modules extends Model
{
    protected $table = 'modules';
    protected $fillable = ['module_name', 'module_desc', 'module_file_desc', 'file_name', 'file_path'];
}
