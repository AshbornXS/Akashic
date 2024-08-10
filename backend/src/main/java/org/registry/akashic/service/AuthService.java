package org.registry.akashic.service;

import lombok.RequiredArgsConstructor;
import org.registry.akashic.domain.User;
import org.registry.akashic.repository.UserRepository;
import org.registry.akashic.requests.AuthRegisterPostRequestBody;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username)).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User register(AuthRegisterPostRequestBody authRegisterPostRequestBody) {
        return userRepository.save(User.builder()
                .name(authRegisterPostRequestBody.getName())
                .username(authRegisterPostRequestBody.getUsername())
                .password(passwordEncoder().encode(authRegisterPostRequestBody.getPassword()))
                .role(authRegisterPostRequestBody.getRole())
                .build());
    }

    public User getLoggedUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}