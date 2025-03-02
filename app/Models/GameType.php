<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameType extends Model
{
    protected $table = 'game_type';

    protected $fillable = ['section_id', 'game_type_name', 'description', 'status',];
}
