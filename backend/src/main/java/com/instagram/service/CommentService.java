package com.instagram.service;

import com.instagram.dto.CommentDto;
import com.instagram.dto.CreateCommentRequest;
import com.instagram.exception.ApiException;
import com.instagram.model.Comment;
import com.instagram.model.NotificationType;
import com.instagram.model.Post;
import com.instagram.model.User;
import com.instagram.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;
    private final NotificationService notificationService;

    public List<CommentDto> getComments(Long postId, User currentUser) {
        Post post = postService.getPostEntity(postId);
        return commentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(c -> toDto(c, currentUser))
                .toList();
    }

    @Transactional
    public CommentDto addComment(Long postId, User author, CreateCommentRequest request) {
        Post post = postService.getPostEntity(postId);
        Comment comment = Comment.builder()
                .post(post)
                .user(author)
                .text(request.getText())
                .build();
        comment = commentRepository.save(comment);
        notificationService.notify(post.getUser(), author, NotificationType.COMMENT, post);
        return toDto(comment, author);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment not found"));

        boolean isAuthor = comment.getUser().getId().equals(currentUser.getId());
        boolean isPostOwner = comment.getPost().getUser().getId().equals(currentUser.getId());

        if (!isAuthor && !isPostOwner) {
            throw ApiException.forbidden("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private CommentDto toDto(Comment comment, User currentUser) {
        return CommentDto.builder()
                .id(comment.getId())
                .author(userService.toDto(comment.getUser(), currentUser))
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
