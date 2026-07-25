package com.instagram.service;

import com.instagram.dto.FollowResponse;
import com.instagram.exception.ApiException;
import com.instagram.model.Follow;
import com.instagram.model.User;
import com.instagram.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserService userService;

    @Transactional
    public FollowResponse toggleFollow(String targetUsername, User currentUser) {
        User target = userService.getByUsername(targetUsername);

        if (target.getId().equals(currentUser.getId())) {
            throw ApiException.badRequest("You cannot follow yourself");
        }

        var existing = followRepository.findByFollowerAndFollowing(currentUser, target);
        boolean nowFollowing;

        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            nowFollowing = false;
        } else {
            followRepository.save(Follow.builder().follower(currentUser).following(target).build());
            nowFollowing = true;
        }

        return FollowResponse.builder()
                .following(nowFollowing)
                .followerCount(followRepository.countByFollowing(target))
                .build();
    }
}
