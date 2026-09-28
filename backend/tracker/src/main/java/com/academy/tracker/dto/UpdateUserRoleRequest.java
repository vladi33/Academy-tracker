package com.academy.tracker.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRoleRequest(

        @NotBlank(message = "Role is required")
        String role

) {
}