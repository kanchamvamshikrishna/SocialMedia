package com.instagram.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 60)
    private String fullName;

    @Size(max = 150)
    private String bio;
}
