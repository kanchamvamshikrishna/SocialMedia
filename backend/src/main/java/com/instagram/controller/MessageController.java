package com.instagram.controller;

import com.instagram.dto.ConversationDto;
import com.instagram.dto.MessageDto;
import com.instagram.dto.SendMessageRequest;
import com.instagram.dto.UploadResponse;
import com.instagram.model.User;
import com.instagram.service.BlobStorageService;
import com.instagram.service.MessageService;
import com.instagram.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final BlobStorageService blobStorageService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(Authentication authentication) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(messageService.getConversations(current));
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<MessageDto>> getThread(@PathVariable String username, Authentication authentication) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(messageService.getThread(current, username));
    }

    @PostMapping("/{username}")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable String username,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(messageService.sendMessage(current, username, request));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file, Authentication authentication) {
        userService.resolve(authentication);
        String url = blobStorageService.upload(file, "messages");
        return ResponseEntity.ok(new UploadResponse(url));
    }
}
