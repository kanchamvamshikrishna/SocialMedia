package com.instagram.service;

import com.instagram.dto.NotificationDto;
import com.instagram.exception.ApiException;
import com.instagram.model.Notification;
import com.instagram.model.NotificationType;
import com.instagram.model.Post;
import com.instagram.model.User;
import com.instagram.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    @Transactional
    public void notify(User recipient, User actor, NotificationType type, Post post) {
        if (recipient.getId().equals(actor.getId())) {
            return; // never notify people about their own actions
        }
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .post(post)
                .build();
        notificationRepository.save(notification);
    }

    public Page<NotificationDto> getForUser(User currentUser, Pageable pageable) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser, pageable)
                .map(n -> toDto(n, currentUser));
    }

    public long getUnreadCount(User currentUser) {
        return notificationRepository.countByRecipientAndReadFalse(currentUser);
    }

    @Transactional
    public void markRead(Long id, User currentUser) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw ApiException.forbidden("You can only manage your own notifications");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(User currentUser) {
        notificationRepository.markAllAsRead(currentUser);
    }

    private NotificationDto toDto(Notification n, User currentUser) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .actor(userService.toDto(n.getActor(), currentUser))
                .postId(n.getPost() != null ? n.getPost().getId() : null)
                .postImageUrl(n.getPost() != null ? n.getPost().getImageUrl() : null)
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
