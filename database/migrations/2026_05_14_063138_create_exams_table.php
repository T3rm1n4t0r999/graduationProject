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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('max_score')->nullable()->default(0);
            $table->foreignId('module_id')->unique()
                ->constrained('modules')
                ->onDelete('cascade');
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->onDelete('cascade');
            $table->integer('max_attempts')->default(0);
            $table->boolean('is_active')->default(true);
            $table->integer('time_limit')->nullable();
            $table->timestamps();

            // Optional: add indexes for foreign keys
            $table->index('module_id');
            $table->index('organization_id');
            $table->index(['organization_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
