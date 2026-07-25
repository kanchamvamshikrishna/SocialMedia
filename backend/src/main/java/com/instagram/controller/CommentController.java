package com.instagram.controller;

import com.instagram.dto.CommentDto;
import com.instagram.dto.CreateCommentRequest;
import com.instagram.model.User;
import com.instagram.service.CommentService;
import com.instagram.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long postId, Authentication authentication) {
        User current = currentUserOrNull(authentication);
        return ResponseEntity.ok(commentService.getComments(postId, current));
    }

    @PostMapping
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        User current = userService.getByUsername(authentication.getName());
        return ResponseEntity.ok(commentService.addComment(postId, current, request));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        User current = userService.getByUsername(authentication.getName());
        commentService.deleteComment(commentId, current);
        return ResponseEntity.noContent().build();
    }

    private User currentUserOrNull(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userService.getByUsername(authentication.getName());
    }
}
