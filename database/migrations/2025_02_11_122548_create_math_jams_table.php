<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('math_jams', function (Blueprint $table) {
            $table->id();
            $table->string('math_jam_id')->unique();
            $table->string('math_jam_code');
            $table->unsignedBigInteger('teacher_id');
            $table->integer('num_questions');
            $table->integer('time_limit');
            $table->string('category');
            $table->string('math_practice_for');
            $table->boolean('show_scores')->default(true);
            $table->boolean('is_paused')->default(false);
            $table->integer('current_question_id')->default(0);
            $table->string('status')->default('waiting');
            $table->timestamps();

            $table->foreign('teacher_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('math_jams');
    }
};
