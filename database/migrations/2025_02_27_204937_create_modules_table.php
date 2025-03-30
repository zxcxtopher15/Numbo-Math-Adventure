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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->integer('section_id');
            $table->string('module_name');
            $table->text('module_desc')->nullable();
            $table->text('module_file_desc')->nullable();
            $table->text('file_name');
            $table->text('file_path');
            $table->tinyInteger('is_submission_required')->default(0);
            $table->integer('points');
            $table->integer('num_of_attempts');
            $table->string('submit_type');
            $table->string('file_type')->nullable();
            $table->tinyInteger('is_comment_enabled')->default(0);
            $table->timestamp('due_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
