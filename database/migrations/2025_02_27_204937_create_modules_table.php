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
            $table->text('module_title')->nullable();
            $table->text('submission_index')->nullable();
            $table->text('points')->nullable();
            $table->text('num_of_attempts')->nullable();
            $table->text('submit_type')->nullable();
            $table->text('file_type')->nullable();
            $table->text('is_comment_enabled')->nullable();
            $table->text('due_date')->nullable();
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
