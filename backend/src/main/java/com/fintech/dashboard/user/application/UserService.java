package com.fintech.dashboard.user.application;

import com.fintech.dashboard.common.exception.ResourceNotFoundException;
import com.fintech.dashboard.user.application.dto.UserResponse;
import com.fintech.dashboard.user.domain.User;
import com.fintech.dashboard.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user);
    }
}
