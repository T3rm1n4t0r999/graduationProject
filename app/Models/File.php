<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'path',
        'disk',
        'size',
        'mime_type',
        'extension',
        'fileable_id',
        'fileable_type',
    ];

    protected $attributes = [
        'name' => 'Файл',
        'disk' => 'public',
    ];

    /**
     * Получить родительскую модель
     */
    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Проверить, является ли файл изображением
     */
    public function getIsImageAttribute(): bool
    {
        return $this->mime_type && str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Проверить, является ли файл видео
     */
    public function getIsVideoAttribute(): bool
    {
        return $this->mime_type && str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Проверить, является ли файл PDF
     */
    public function getIsPdfAttribute(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    /**
     * Получить URL файла
     */
    public function getUrlAttribute(): string
    {
        if (!$this->path) {
            return '';
        }

        return \Storage::disk($this->disk)->url($this->path);
    }

    /**
     * Получить человеко-читаемый размер
     */
    public function getHumanSizeAttribute(): string
    {
        if (!$this->size) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    /**
     * Boot метод для установки значений по умолчанию
     */
    protected static function booted()
    {
        static::creating(function ($file) {
            if (empty($file->name) && $file->path) {
                $file->name = basename($file->path);
            }
        });
    }
}
