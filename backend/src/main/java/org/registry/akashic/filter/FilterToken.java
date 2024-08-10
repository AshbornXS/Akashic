package org.registry.akashic.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.registry.akashic.repository.UserRepository;
import org.registry.akashic.service.TokenService;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
@Log4j2
public class FilterToken extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Override
    @NonNull
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader("Authorization");

        if (token != null) {
            token = token.replace("Bearer ", "");
            var subject = tokenService.getSubject(token);
            var user = userRepository.findByUsername(subject);

            if (user != null) {
                var role = tokenService.getRole(token);

                var authorities = user.getAuthorities().stream()
                        .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                        .collect(Collectors.toList());

                if (role != null && authorities.stream().noneMatch(a -> a.getAuthority().equals(role))) {
                    authorities.add(new SimpleGrantedAuthority(role));
                }

                var authenticated = new UsernamePasswordAuthenticationToken(user, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authenticated);
            } else {
                log.warn("User not found for token: {}", token);
            }
        } else {
            log.warn("Token not found or invalid format");
        }

        filterChain.doFilter(request, response);

    }
}