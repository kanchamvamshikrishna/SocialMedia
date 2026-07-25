package com.instagram.repository;

import com.instagram.model.Follow;
import com.instagram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    boolean existsByFollowerAndFollowing(User follower, User following);

    long countByFollowing(User following);

    long countByFollower(User follower);

    List<Follow> findByFollower(User follower);

    List<Follow> findByFollowing(User following);
}
