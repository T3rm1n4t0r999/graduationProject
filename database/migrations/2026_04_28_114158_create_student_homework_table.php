<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_homeworks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homework_id')->constrained('homeworks')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->timestamp('granted_at')->useCurrent();
            $table->string('granted_by')->default('admin');
            $table->timestamps();

            // ✅ student_id ПЕРВЫМ — чаще ищем "все ДЗ студента", чем "все студенты с этим ДЗ"
            $table->unique(['student_id', 'homework_id'], 'student_homework_unique');

            // ✅ Составной индекс для быстрой фильтрации по организации + студенту
            $table->index(['organization_id', 'student_id'], 'sh_org_student_idx');

            // ✅ Индекс для поиска всех студентов с конкретным ДЗ (используется в whereDoesntHave)
            $table->index('homework_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_homeworks');
    }
};
