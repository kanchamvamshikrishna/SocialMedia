package com.instagram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dev-mode response: no real email provider is wired up for this assessment,
 * so the reset link is returned directly instead of being emailed. Swapping in
 * a provider (e.g. Resend/Nodemailer) later only requires sending this same
 * link by email and dropping the fields below from the response body.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponse {
    private String message;
    private String devResetToken;
    private String devResetLink;
}
