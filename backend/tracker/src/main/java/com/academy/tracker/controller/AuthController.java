package com.academy.tracker.controller;

import com.academy.tracker.entity.User;
import com.academy.tracker.repository.UserRepository;
import com.academy.tracker.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("The user has been registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        if (userOpt.isEmpty() || !encoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Error: Invalid username or password!");
        }

        User user = userOpt.get();

        String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", user.getUsername(),
                "role", user.getRole()
        ));
    }
}