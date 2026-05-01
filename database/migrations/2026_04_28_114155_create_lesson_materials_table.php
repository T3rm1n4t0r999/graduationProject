<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->integer('order')->default(0);
            $table->enum('material_type', ['theory', 'example', 'reference', 'video_lesson', 'article'])->default('theory');
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index('lesson_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_materials');
    }
};
