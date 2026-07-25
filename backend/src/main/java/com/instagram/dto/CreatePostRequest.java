package com.instagram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostRequest {

    @NotBlank(message = "An image is required for the post")
    private String imageUrl;

    @Size(max = 2200)
    private String caption;
}
