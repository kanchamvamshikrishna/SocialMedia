package com.instagram.controller;

import com.instagram.dto.NotificationDto;
import com.instagram.model.User;
import com.instagram.service.NotificationService;
import com.instagram.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        User current = userService.resolve(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getForUser(current, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User current = userService.resolve(authentication);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(current)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication authentication) {
        User current = userService.resolve(authentication);
        notificationService.markRead(id, current);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        User current = userService.resolve(authentication);
        notificationService.markAllRead(current);
        return ResponseEntity.ok().build();
    }
}
