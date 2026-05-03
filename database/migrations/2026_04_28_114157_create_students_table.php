<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('telegram_id')->unique();
            $table->string('username')->nullable();
            $table->string('firstname');
            $table->string('lastname')->default('');
            $table->enum('role', ['guest', 'student', 'premium'])->default('guest');
            $table->bigInteger('score')->default(0);
            $table->string('rank')->default('Новичок');
            $table->foreignId('organization_id')->nullable()
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->timestamps();

            // Индексы для оптимизации
            $table->index('organization_id');
            $table->index('telegram_id');
            $table->index('role');
            $table->index('score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
