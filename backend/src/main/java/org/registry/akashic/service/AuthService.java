package org.registry.akashic.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.registry.akashic.domain.User;
import org.registry.akashic.repository.UserRepository;
import org.registry.akashic.requests.AuthPutRequestBody;
import org.registry.akashic.requests.AuthRegisterPostRequestBody;
import org.registry.akashic.util.ImageUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username)).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User register(AuthRegisterPostRequestBody authRegisterPostRequestBody, MultipartFile profilePicture) throws IOException {
        byte[] compressedImage = ImageUtil.compressImage(profilePicture.getBytes());
        return userRepository.save(User.builder()
                .name(authRegisterPostRequestBody.getName())
                .username(authRegisterPostRequestBody.getUsername())
                .password(passwordEncoder().encode(authRegisterPostRequestBody.getPassword()))
                .role(authRegisterPostRequestBody.getRole())
                .profilePic(compressedImage)
                .build());
    }

    public User update(AuthPutRequestBody authPutRequestBody, MultipartFile profilePicture) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        if (authPutRequestBody.getName() != null && !authPutRequestBody.getName().isEmpty()) {
            user.setName(authPutRequestBody.getName());
        }
        if (authPutRequestBody.getUsername() != null && !authPutRequestBody.getUsername().isEmpty()) {
            user.setUsername(authPutRequestBody.getUsername());
        }
        if (authPutRequestBody.getPassword() != null && !authPutRequestBody.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder().encode(authPutRequestBody.getPassword()));
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {
            byte[] compressedImage = ImageUtil.compressImage(profilePicture.getBytes());
            user.setProfilePic(compressedImage);
        }
        return userRepository.save(user);
    }

    public User updateProfilePicture(MultipartFile profilePicture) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        if (profilePicture != null && !profilePicture.isEmpty()) {
            byte[] compressedImage = ImageUtil.compressImage(profilePicture.getBytes());
            user.setProfilePic(compressedImage);
        }
        return userRepository.save(user);
    }

    public User favoriteBook(Long bookId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        if (user.getFav() == null) {
            user.setFav(new ArrayList<>());
        }

        user.getFav().add(bookId);
        return userRepository.save(user);
    }

    public User unfavoriteBook(Long bookId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        if (user.getFav() != null) {
            user.getFav().remove(bookId);
        }

        return userRepository.save(user);
    }

    public User getLoggedUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(authentication.getName());
        log.warn("User Photo Before: {}", user.getProfilePic());
        user.setProfilePic(ImageUtil.decompressImage(user.getProfilePic()));
        log.warn("User Photo: {}", user.getProfilePic());
        return user;
    }

    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}