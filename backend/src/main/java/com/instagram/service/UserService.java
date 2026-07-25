package com.instagram.service;

import com.instagram.dto.UpdateProfileRequest;
import com.instagram.dto.UserDto;
import com.instagram.exception.ApiException;
import com.instagram.model.User;
import com.instagram.repository.FollowRepository;
import com.instagram.repository.PostRepository;
import com.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("User not found: " + username));
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    /** Resolves the caller for an endpoint that requires a logged-in user. */
    public User resolve(Authentication authentication) {
        return getByUsername(authentication.getName());
    }

    /**
     * Resolves the caller for a public endpoint where being logged in only changes
     * the response (e.g. "followedByCurrentUser"). Spring Security's default
     * anonymous authentication filter means {@code authentication} is never
     * literally null here -- unauthenticated requests carry an
     * AnonymousAuthenticationToken instead, which this treats as "no user".
     */
    public User resolveOrNull(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return getByUsername(authentication.getName());
    }

    public UserDto getProfile(String username, User currentUser) {
        User user = getByUsername(username);
        return toDto(user, currentUser);
    }

    @Transactional
    public UserDto updateProfile(User currentUser, UpdateProfileRequest request) {
        currentUser.setFullName(request.getFullName());
        currentUser.setBio(request.getBio());
        userRepository.save(currentUser);
        return toDto(currentUser, currentUser);
    }

    @Transactional
    public UserDto updateAvatar(User currentUser, String avatarUrl) {
        currentUser.setAvatarUrl(avatarUrl);
        userRepository.save(currentUser);
        return toDto(currentUser, currentUser);
    }

    public List<UserDto> search(String query, User currentUser) {
        return userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .map(u -> toDto(u, currentUser))
                .toList();
    }

    public UserDto toDto(User user, User currentUser) {
        boolean followed = currentUser != null
                && !currentUser.getId().equals(user.getId())
                && followRepository.existsByFollowerAndFollowing(currentUser, user);

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .postCount(postRepository.countByUser(user))
                .followerCount(followRepository.countByFollowing(user))
                .followingCount(followRepository.countByFollower(user))
                .followedByCurrentUser(followed)
                .build();
    }
}
