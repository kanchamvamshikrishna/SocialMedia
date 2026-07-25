package com.instagram.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendMessageRequest {

    @Size(max = 2000)
    private String text;

    @Size(max = 500)
    private String imageUrl;
}
