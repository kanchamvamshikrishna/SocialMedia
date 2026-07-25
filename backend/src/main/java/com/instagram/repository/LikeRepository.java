package com.instagram.repository;

import com.instagram.model.Like;
import com.instagram.model.Post;
import com.instagram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByPostAndUser(Post post, User user);

    boolean existsByPostAndUser(Post post, User user);

    long countByPost(Post post);

    void deleteByPost(Post post);
}
