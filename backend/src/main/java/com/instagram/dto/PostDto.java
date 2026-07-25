package com.instagram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private UserDto author;
    private String imageUrl;
    private String caption;
    private Instant createdAt;
    private long likeCount;
    private long commentCount;
    private boolean likedByCurrentUser;
}
