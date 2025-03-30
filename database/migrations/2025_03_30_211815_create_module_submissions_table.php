<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('module_submissions', function (Blueprint $table) {
            $table->id();
            $table->integer('student_id');
            $table->text('text_answer')->nullable();
            $table->string('upload_file')->nullable();
            $table->text('comment')->nullable();
            $table->integer('score');
            $table->integer('total_attempts')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_submissions');
    }
};
