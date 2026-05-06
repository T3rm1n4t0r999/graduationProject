<?php

namespace App\Mail;

use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrganizationVerificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Organization $organization,
        public string $verificationUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Подтвердите организацию «' . $this->organization->name . '»',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.organization-verification-html',   // ← новый HTML-шаблон
            text: 'emails.organization-verification-text',    // ← простой текст для читабельности
            with: [
                'organizationName' => $this->organization->name,
                'verificationUrl'  => $this->verificationUrl,
            ],
        );
    }
}
