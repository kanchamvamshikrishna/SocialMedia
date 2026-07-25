package com.instagram.dto;

import com.instagram.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private NotificationType type;
    private UserDto actor;
    private Long postId;
    private String postImageUrl;
    private boolean read;
    private Instant createdAt;
}
