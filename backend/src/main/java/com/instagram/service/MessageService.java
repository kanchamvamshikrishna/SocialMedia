package com.instagram.service;

import com.instagram.dto.ConversationDto;
import com.instagram.dto.MessageDto;
import com.instagram.dto.SendMessageRequest;
import com.instagram.exception.ApiException;
import com.instagram.model.Message;
import com.instagram.model.NotificationType;
import com.instagram.model.User;
import com.instagram.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public List<ConversationDto> getConversations(User currentUser) {
        return messageRepository.findLatestMessagePerConversation(currentUser.getId()).stream()
                .map(m -> {
                    User other = m.getSender().getId().equals(currentUser.getId()) ? m.getRecipient() : m.getSender();
                    return ConversationDto.builder()
                            .otherUser(userService.toDto(other, currentUser))
                            .lastMessage(toDto(m, currentUser))
                            .build();
                })
                .toList();
    }

    @Transactional
    public List<MessageDto> getThread(User currentUser, String otherUsername) {
        User other = userService.getByUsername(otherUsername);
        messageRepository.markThreadSeen(other.getId(), currentUser.getId());
        return messageRepository.findConversation(currentUser.getId(), other.getId()).stream()
                .map(m -> toDto(m, currentUser))
                .toList();
    }

    @Transactional
    public MessageDto sendMessage(User currentUser, String recipientUsername, SendMessageRequest request) {
        User recipient = userService.getByUsername(recipientUsername);

        if (recipient.getId().equals(currentUser.getId())) {
            throw ApiException.badRequest("You cannot message yourself");
        }
        boolean noText = request.getText() == null || request.getText().isBlank();
        boolean noImage = request.getImageUrl() == null || request.getImageUrl().isBlank();
        if (noText && noImage) {
            throw ApiException.badRequest("A message needs text or an image");
        }

        Message message = Message.builder()
                .sender(currentUser)
                .recipient(recipient)
                .text(noText ? null : request.getText())
                .imageUrl(noImage ? null : request.getImageUrl())
                .build();

        Message saved = messageRepository.save(message);
        notificationService.notify(recipient, currentUser, NotificationType.MESSAGE, null);
        return toDto(saved, currentUser);
    }

    private MessageDto toDto(Message message, User currentUser) {
        return MessageDto.builder()
                .id(message.getId())
                .sender(userService.toDto(message.getSender(), currentUser))
                .text(message.getText())
                .imageUrl(message.getImageUrl())
                .createdAt(message.getCreatedAt())
                .mine(message.getSender().getId().equals(currentUser.getId()))
                .seen(message.isSeen())
                .build();
    }
}
