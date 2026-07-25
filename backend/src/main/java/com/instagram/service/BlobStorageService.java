package com.instagram.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.instagram.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

/**
 * Uploads files to Vercel Blob storage over its raw HTTP PUT API, mirroring the
 * wire protocol used by the official @vercel/blob Node SDK (server-side put()).
 * There is no first-party Java client for Vercel Blob, so this talks to the
 * storage endpoint directly. If Vercel changes that wire format, the fallback
 * is to swap this class out for Cloudinary (see README "Image storage" section)
 * without touching any controller/service code that calls upload().
 */
@Service
public class BlobStorageService {

    private static final String BLOB_API_BASE = "https://blob.vercel-storage.com";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String readWriteToken;

    public BlobStorageService(@Value("${app.blob.read-write-token:}") String readWriteToken) {
        this.readWriteToken = readWriteToken;
    }

    public String upload(MultipartFile file, String folder) {
        if (readWriteToken == null || readWriteToken.isBlank()) {
            throw ApiException.badRequest(
                    "Image storage is not configured. Set the BLOB_READ_WRITE_TOKEN environment variable.");
        }
        if (file.isEmpty()) {
            throw ApiException.badRequest("Uploaded file is empty");
        }

        String extension = extractExtension(file.getOriginalFilename());
        String pathname = folder + "/" + UUID.randomUUID() + extension;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BLOB_API_BASE + "/" + pathname))
                    .header("Authorization", "Bearer " + readWriteToken)
                    .header("x-content-type", file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .header("x-api-version", "7")
                    .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode body = objectMapper.readTree(response.body());
                if (body.has("url")) {
                    return body.get("url").asText();
                }
            }

            throw ApiException.badRequest("Image upload failed (status " + response.statusCode() + "): " + response.body());
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Image upload failed: " + e.getMessage());
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
}
