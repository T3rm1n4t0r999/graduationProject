<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invitation $invitation,
        public string $acceptUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Вас пригласили в организацию «' . $this->invitation->organization->name . '»',
        );
    }

    public function content(): Content
    {
        if ($this->invitation->type === 'student') {
            $bot = $this->invitation->organization->bot;

            return new Content(
                view: 'emails.invitation-student-html',
                text: 'emails.invitation-student-text',
                with: [
                    'organizationName' => $this->invitation->organization->name,
                    'token'            => $this->invitation->token,
                    'expiresAt'        => $this->invitation->expires_at->format('d.m.Y H:i'),
                    'botUrl'           => $bot?->bot_url,
                ],
            );
        }

        // Для teacher, manager и других — стандартное письмо с кнопкой принятия
        return new Content(
            view: 'emails.invitation-html',
            text: 'emails.invitation-text',
            with: [
                'organizationName' => $this->invitation->organization->name,
                'acceptUrl'        => $this->acceptUrl,
                'expiresAt'        => $this->invitation->expires_at->format('d.m.Y H:i'),
            ],
        );
    }
}
