package com.academy.tracker.dto;

import com.academy.tracker.entity.User;

public record UserSummaryResponse(Long id, String username, String role) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(user.getId(), user.getUsername(), user.getRole().name());
    }
}
