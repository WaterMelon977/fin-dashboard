package com.fintech.dashboard.user.application;

import com.fintech.dashboard.user.application.dto.LoginRequest;
import com.fintech.dashboard.user.application.dto.LoginResponse;
import com.fintech.dashboard.user.application.dto.RegisterRequest;
import com.fintech.dashboard.user.application.dto.UserResponse;
import com.fintech.dashboard.user.domain.User;
import com.fintech.dashboard.user.domain.UserStatus;
import com.fintech.dashboard.user.infrastructure.UserRepository;
import com.fintech.dashboard.user.security.JwtService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.expiration-ms}")
    private long jwtExpiration;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            // 409 conflict — email already registered
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        return new UserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // authenticate throws BadCredentialsException if wrong — spring handles the 401
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(); // cannot be empty — authentication above already validated it

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                "Bearer",
                jwtExpiration / 1000, // return seconds to client, not milliseconds
                new UserResponse(user));
    }
}
