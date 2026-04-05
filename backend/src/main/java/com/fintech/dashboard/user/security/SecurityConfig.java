package com.fintech.dashboard.user.security;

import com.fintech.dashboard.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
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

                        // categories — all authenticated roles can read (dropdown data)
                        .requestMatchers(HttpMethod.GET, "/categories/**").authenticated()

                        // financial records
                        .requestMatchers(HttpMethod.GET, "/records/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/records/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/records/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/records/**").hasRole("ADMIN")

                        // dashboard — summary and last5 open to all roles; breakdown analyst+admin
                        .requestMatchers(HttpMethod.GET, "/dashboard/summary", "/dashboard/last5").authenticated()
                        .requestMatchers(HttpMethod.GET, "/dashboard/breakdown").hasAnyRole("ANALYST", "ADMIN")

                        // user management
                        .requestMatchers(HttpMethod.GET, "/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        // everything else requires authentication
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService()),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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