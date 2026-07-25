package com.instagram.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(
            "test-secret-key-that-is-long-enough-for-hmac-sha-signing",
            3_600_000L
    );

    @Test
    void generatesTokenThatCarriesTheSubject() {
        String token = jwtService.generateToken("jane_doe");

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("jane_doe", jwtService.extractUsername(token));
    }

    @Test
    void rejectsGarbageTokens() {
        assertFalse(jwtService.isTokenValid("not-a-real-jwt"));
    }

    @Test
    void tokenWithNegativeExpirationIsImmediatelyInvalid() {
        JwtService expired = new JwtService(
                "test-secret-key-that-is-long-enough-for-hmac-sha-signing",
                -1000L
        );
        String token = expired.generateToken("jane_doe");
        assertFalse(expired.isTokenValid(token));
    }
}
