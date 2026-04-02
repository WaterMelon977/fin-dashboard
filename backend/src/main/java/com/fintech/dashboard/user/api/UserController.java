package com.fintech.dashboard.user.api;

import com.fintech.dashboard.common.response.ApiResponse;
import com.fintech.dashboard.user.application.UserService;
import com.fintech.dashboard.user.application.dto.UserResponse;
import com.fintech.dashboard.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse response = userService.toResponse(principal.getUser());
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", response));
    }

}
