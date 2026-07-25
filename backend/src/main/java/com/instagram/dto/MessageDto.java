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
public class MessageDto {
    private Long id;
    private UserDto sender;
    private String text;
    private String imageUrl;
    private Instant createdAt;
    private boolean mine;
    private boolean seen;
}
