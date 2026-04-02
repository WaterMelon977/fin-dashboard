package com.fintech.dashboard.user.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fintech.dashboard.user.domain.User;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long jwtExpiration;

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parseClaims(token);
        return claimsResolver.apply(claims);
    }

    // public String generateToken(String username) {
    // return buildToken(username, jwtExpiration);
    // }

    // private String buildToken(String username, long expiration) {
    // return Jwts.builder()
    // .subject(username)
    // .issuedAt(new Date(System.currentTimeMillis()))
    // .expiration(new Date(System.currentTimeMillis() + expiration))
    // .signWith(getSignInKey())
    // .compact();
    // }

    // generate a token carrying userId, email, and role as claims
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // expired, malformed, wrong signature — all treated the same way
            return false;
        }
    }

    // private boolean isTokenExpired(String token) {
    // try {
    // parseClaims(token);
    // return true;
    // } catch (JwtException | IllegalArgumentException e) {
    // // expired, malformed, wrong signature — all treated the same way
    // return false;
    // }
    // }

    // private Date extractExpiration(String token) {
    // return extractClaim(token, Claims::getExpiration);
    // }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
