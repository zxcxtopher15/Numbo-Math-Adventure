<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'category';

    protected $fillable = ['section_id', 'game_type_id', 'category_name', 'description', 'example', 'status'];
}
