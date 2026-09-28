package com.academy.tracker.config;

import com.academy.tracker.entity.User;
import com.academy.tracker.entity.UserRole;
import com.academy.tracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public AdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.password}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        String normalizedUsername = adminUsername.trim();

        if (normalizedUsername.length() < 3) {
            throw new IllegalStateException(
                    "ADMIN_USERNAME must contain at least 3 characters"
            );
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD must contain at least 12 characters"
            );
        }

        User administrator = userRepository
                .findByUsername(normalizedUsername)
                .orElseGet(User::new);

        administrator.setUsername(normalizedUsername);
        administrator.setRole(UserRole.ADMIN);

        if (
                administrator.getPassword() == null ||
                        !passwordEncoder.matches(
                                adminPassword,
                                administrator.getPassword()
                        )
        ) {
            administrator.setPassword(
                    passwordEncoder.encode(adminPassword)
            );
        }

        userRepository.save(administrator);

        LOGGER.info(
                "Administrator account is ready: {}",
                normalizedUsername
        );
    }
}