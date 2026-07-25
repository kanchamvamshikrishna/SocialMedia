package com.instagram.controller;

import com.instagram.dto.CreatePostRequest;
import com.instagram.dto.LikeResponse;
import com.instagram.dto.PostDto;
import com.instagram.dto.UploadResponse;
import com.instagram.model.User;
import com.instagram.service.BlobStorageService;
import com.instagram.service.LikeService;
import com.instagram.service.PostService;
import com.instagram.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final LikeService likeService;
    private final UserService userService;
    private final BlobStorageService blobStorageService;

    @PostMapping("/upload-image")
    public ResponseEntity<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file, Authentication authentication) {
        currentUser(authentication);
        String url = blobStorageService.upload(file, "posts");
        return ResponseEntity.ok(new UploadResponse(url));
    }

    @PostMapping
    public ResponseEntity<PostDto> createPost(@Valid @RequestBody CreatePostRequest request, Authentication authentication) {
        User current = currentUser(authentication);
        return ResponseEntity.ok(postService.createPost(current, request));
    }

    @GetMapping("/explore")
    public ResponseEntity<Page<PostDto>> explore(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Authentication authentication
    ) {
        User current = currentUserOrNull(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getExploreFeed(current, pageable));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostDto>> feed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Authentication authentication
    ) {
        User current = currentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getHomeFeed(current, pageable));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PostDto>> userPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Authentication authentication
    ) {
        User current = currentUserOrNull(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getUserPosts(username, current, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long id, Authentication authentication) {
        User current = currentUserOrNull(authentication);
        return ResponseEntity.ok(postService.getPost(id, current));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        User current = currentUser(authentication);
        postService.deletePost(id, current);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<LikeResponse> toggleLike(@PathVariable Long id, Authentication authentication) {
        User current = currentUser(authentication);
        return ResponseEntity.ok(likeService.toggleLike(id, current));
    }

    private User currentUser(Authentication authentication) {
        return userService.getByUsername(authentication.getName());
    }

    private User currentUserOrNull(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userService.getByUsername(authentication.getName());
    }
}
