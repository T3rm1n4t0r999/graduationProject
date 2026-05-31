<?php

use App\Enums\OrganizationStatus;
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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->foreignId('owner_id')->constrained('users');
            $table->string('email')->nullable();
            $table->string('status')->default(OrganizationStatus::PendingVerification->value);
            $table->json('settings')->nullable();
            $table->string('plan')->nullable();
            $table->string('email_verification_token')->nullable()->after('email');
            $table->timestamp('email_verified_at')->nullable()->after('email_verification_token');
            $table->timestamps();

            $table->index('email_verification_token');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
