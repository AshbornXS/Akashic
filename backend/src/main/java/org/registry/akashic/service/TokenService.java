package org.registry.akashic.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.registry.akashic.domain.User;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final String SECRET_KEY = "akashicprojectiskillingme";

    public String genToken(User user) {
        return JWT.create()
                .withSubject(user.getUsername())
                .withClaim("role", user.getRole())
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public String getSubject(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                .build()
                .verify(token)
                .getSubject();
    }

    public String getRole(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                .build()
                .verify(token)
                .getClaim("role").asString();
    }
}