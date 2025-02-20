<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderedQuestion extends Model {
    use HasFactory;

    protected $fillable = ['math_jam_id', 'question_id', 'order_number', 'time'];
}
