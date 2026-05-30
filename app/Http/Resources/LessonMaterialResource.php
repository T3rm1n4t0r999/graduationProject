<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LessonMaterialResource extends JsonResource
{
    public static $wrap = false;
    public function toArray($request): array
    {
        $image = $this->files()->where('mime_type', 'LIKE', 'image/%')->first();
        $video = $this->files()->where('mime_type', 'LIKE', 'video/%')->first();


        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'lesson_id' => $this->lesson_id,
            'material_type' => $this->material_type,
            'content' => $this->content,
            'video_url' => $this->video_url,
            'image' => $image ? [
                'id'         => $image->id,
                'url'        => $image->url,
                'name'       => $image->name,
                'human_size' => $image->human_size,
                'is_image'   => $image->is_image,
            ] : null,
            'video' => $video ? [
                'id'         => $video->id,
                'url'        => $video->url,
                'name'       => $video->name,
                'human_size' => $video->human_size,
                'is_video'   => $video->is_video,
            ] : null,

            'lessonTasks'        => LessonTaskResource::collection($this->whenLoaded('lessonTasks')),
            'lessonTasks_count'  => $this->whenCounted('lessonTasks'),
            'lessonMaterials'        => LessonMaterialResource::collection($this->whenLoaded('lessonMaterials')),
            'lessonMaterials_count'  => $this->whenCounted('lessonMaterials'),
        ];
    }
    public function showDetails(bool $show = true): static
    {
        $this->showDetails = $show;
        return $this;
    }
}
