package org.registry.akashic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.registry.akashic.domain.User;
import org.registry.akashic.requests.AuthLoginPostRequestBody;
import org.registry.akashic.requests.AuthRegisterPostRequestBody;
import org.registry.akashic.service.AuthService;
import org.registry.akashic.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    @Autowired
    private final TokenService tokenService;

    @PostMapping("/login")
    public String login(@RequestBody @Valid AuthLoginPostRequestBody authLoginPostRequestBody) {
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                new UsernamePasswordAuthenticationToken(authLoginPostRequestBody.getUsername(),
                        authLoginPostRequestBody.getPassword());

        Authentication authenticate = authenticationManager.authenticate(usernamePasswordAuthenticationToken);

        var user = (User) authenticate.getPrincipal();

        var token = tokenService.genToken(user);

        return token + ", " + user.getId() + ", " + user.getUsername();
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody @Valid AuthRegisterPostRequestBody authRegisterPostRequestBody) {
        return new ResponseEntity<>(authService.register(authRegisterPostRequestBody), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getLoggedUserDetails() {
        return ResponseEntity.ok(authService.getLoggedUserDetails());
    }
}
