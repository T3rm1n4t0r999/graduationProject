<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('module_id')
                ->constrained('modules')
                ->cascadeOnDelete();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index('organization_id');
            $table->index('title');
            $table->index('module_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
