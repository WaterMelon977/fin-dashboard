package com.fintech.dashboard.user.security;

import com.fintech.dashboard.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // stateless api — csrf not needed
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // public endpoints — no token required
                        .requestMatchers("/auth/**").permitAll()

                        // swagger ui — open during development
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/hello")
                        .permitAll()

                        // actuator health — public
                        .requestMatchers("/actuator/health").permitAll()

                        // financial records — POST and DELETE restricted to ADMIN only
                        // this is the core role restriction for today's checkpoint
                        .requestMatchers(HttpMethod.POST, "/records/**").hasAnyRole("ADMIN", "ANALYST")
                        .requestMatchers(HttpMethod.PUT, "/records/**").hasAnyRole("ADMIN", "ANALYST")
                        .requestMatchers(HttpMethod.DELETE, "/records/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/records/**").authenticated()

                        // dashboard — all authenticated roles
                        .requestMatchers(HttpMethod.GET, "/dashboard/**").authenticated()

                        // user management — admin only
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        // everything else requires authentication
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService()),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}