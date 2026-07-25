package com.instagram.controller;

import com.instagram.dto.FollowResponse;
import com.instagram.dto.UpdateProfileRequest;
import com.instagram.dto.UserDto;
import com.instagram.model.User;
import com.instagram.service.BlobStorageService;
import com.instagram.service.FollowService;
import com.instagram.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FollowService followService;
    private final BlobStorageService blobStorageService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(userService.toDto(current, current));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getProfile(@PathVariable String username, Authentication authentication) {
        User current = userService.resolveOrNull(authentication);
        return ResponseEntity.ok(userService.getProfile(username, current));
    }

    @GetMapping("/search/{query}")
    public ResponseEntity<List<UserDto>> search(@PathVariable String query, Authentication authentication) {
        User current = userService.resolveOrNull(authentication);
        return ResponseEntity.ok(userService.search(query, current));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(userService.updateProfile(current, request));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserDto> updateAvatar(@RequestParam("file") MultipartFile file, Authentication authentication) {
        User current = userService.resolve(authentication);
        String url = blobStorageService.upload(file, "avatars");
        return ResponseEntity.ok(userService.updateAvatar(current, url));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<FollowResponse> toggleFollow(@PathVariable String username, Authentication authentication) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(followService.toggleFollow(username, current));
    }
}
