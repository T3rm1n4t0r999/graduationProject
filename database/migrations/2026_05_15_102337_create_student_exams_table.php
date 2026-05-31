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
        Schema::create('student_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->timestamp('granted_at')->useCurrent();
            $table->string('granted_by')->default('admin');
            $table->timestamps();

            // ✅ student_id ПЕРВЫМ
            $table->unique(['student_id', 'exam_id'], 'student_exam_unique');

            // ✅ Составной индекс для фильтрации
            $table->index(['organization_id', 'student_id'], 'se_org_student_idx');

            // ✅ Индекс для поиска всех студентов с конкретным экзаменом
            $table->index('exam_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_exams');
    }
};
