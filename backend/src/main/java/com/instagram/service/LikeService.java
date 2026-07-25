package com.instagram.service;

import com.instagram.dto.LikeResponse;
import com.instagram.model.Like;
import com.instagram.model.NotificationType;
import com.instagram.model.Post;
import com.instagram.model.User;
import com.instagram.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostService postService;
    private final NotificationService notificationService;

    @Transactional
    public LikeResponse toggleLike(Long postId, User currentUser) {
        Post post = postService.getPostEntity(postId);

        var existing = likeRepository.findByPostAndUser(post, currentUser);
        boolean nowLiked;

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            nowLiked = false;
        } else {
            likeRepository.save(Like.builder().post(post).user(currentUser).build());
            nowLiked = true;
            notificationService.notify(post.getUser(), currentUser, NotificationType.LIKE, post);
        }

        return LikeResponse.builder()
                .liked(nowLiked)
                .likeCount(likeRepository.countByPost(post))
                .build();
    }
}
