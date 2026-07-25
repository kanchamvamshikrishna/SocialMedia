package com.instagram.service;

import com.instagram.dto.CreatePostRequest;
import com.instagram.dto.PostDto;
import com.instagram.exception.ApiException;
import com.instagram.model.NotificationType;
import com.instagram.model.Post;
import com.instagram.model.User;
import com.instagram.repository.CommentRepository;
import com.instagram.repository.FollowRepository;
import com.instagram.repository.LikeRepository;
import com.instagram.repository.NotificationRepository;
import com.instagram.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final FollowRepository followRepository;
    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public PostDto createPost(User author, CreatePostRequest request) {
        Post post = Post.builder()
                .user(author)
                .imageUrl(request.getImageUrl())
                .caption(request.getCaption())
                .build();
        post = postRepository.save(post);

        Post savedPost = post;
        followRepository.findByFollowing(author)
                .forEach(f -> notificationService.notify(f.getFollower(), author, NotificationType.POST, savedPost));

        return toDto(post, author);
    }

    public Page<PostDto> getExploreFeed(User currentUser, Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(post -> toDto(post, currentUser));
    }

    public Page<PostDto> getHomeFeed(User currentUser, Pageable pageable) {
        List<Long> followingIds = followRepository.findByFollower(currentUser).stream()
                .map(f -> f.getFollowing().getId())
                .collect(Collectors.toList());
        followingIds.add(currentUser.getId());

        return postRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable)
                .map(post -> toDto(post, currentUser));
    }

    public Page<PostDto> getUserPosts(String username, User currentUser, Pageable pageable) {
        User user = userService.getByUsername(username);
        return postRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(post -> toDto(post, currentUser));
    }

    public PostDto getPost(Long id, User currentUser) {
        Post post = getPostEntity(id);
        return toDto(post, currentUser);
    }

    public Post getPostEntity(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Post not found"));
    }

    @Transactional
    public void deletePost(Long id, User currentUser) {
        Post post = getPostEntity(id);
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw ApiException.forbidden("You can only delete your own posts");
        }
        notificationRepository.deleteByPost(post);
        commentRepository.deleteByPost(post);
        likeRepository.deleteByPost(post);
        postRepository.delete(post);
    }

    public PostDto toDto(Post post, User currentUser) {
        boolean liked = currentUser != null && likeRepository.existsByPostAndUser(post, currentUser);

        return PostDto.builder()
                .id(post.getId())
                .author(userService.toDto(post.getUser(), currentUser))
                .imageUrl(post.getImageUrl())
                .caption(post.getCaption())
                .createdAt(post.getCreatedAt())
                .likeCount(likeRepository.countByPost(post))
                .commentCount(commentRepository.countByPost(post))
                .likedByCurrentUser(liked)
                .build();
    }
}
