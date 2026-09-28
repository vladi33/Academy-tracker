package com.academy.tracker.controller;

import com.academy.tracker.dto.AuthResponse;
import com.academy.tracker.dto.LoginRequest;
import com.academy.tracker.dto.MessageResponse;
import com.academy.tracker.dto.RegisterRequest;
import com.academy.tracker.entity.User;
import com.academy.tracker.entity.UserRole;
import com.academy.tracker.repository.UserRepository;
import com.academy.tracker.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final String instructorSecret;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            @Value("${app.instructor-secret}") String instructorSecret
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.instructorSecret = instructorSecret;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        String normalizedUsername = request.username().trim();
        if (userRepository.findByUsername(normalizedUsername).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.role().trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be STUDENT or INSTRUCTOR");
        }

        if (role != UserRole.STUDENT && role != UserRole.INSTRUCTOR) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role must be STUDENT or INSTRUCTOR"
            );
        }

        if (role == UserRole.INSTRUCTOR && !instructorSecret.equals(request.instructorCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid instructor secret code");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("The user has been registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }
}
