package com.instagram.repository;

import com.instagram.model.Comment;
import com.instagram.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    long countByPost(Post post);

    void deleteByPost(Post post);
}
