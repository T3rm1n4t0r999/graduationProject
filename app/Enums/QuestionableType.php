<?php

namespace App\Enums;

enum QuestionableType: string
{
    case LessonTask = 'LessonTask';
    case Homework = 'homework';
    case Exam = 'exam';

    public function label(): string
    {
        return match ($this) {
            self::LessonTask => 'Практическое задание',
            self::Homework => 'Домашняя работа',
            self::Exam => 'Контрольная работа',
        };
    }
}
