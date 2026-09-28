package com.academy.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record CreateSubmissionRequest(
        @NotNull(message = "Assignment is required")
        Long assignmentId,

        @NotBlank(message = "GitHub URL is required")
        @Size(max = 500, message = "GitHub URL must be at most 500 characters")
        @URL(protocol = "https", message = "GitHub URL must be a valid HTTPS URL")
        String githubUrl,

        @Size(max = 500, message = "Deployed URL must be at most 500 characters")
        @URL(message = "Deployed URL must be a valid URL")
        String deployedUrl,

        @NotBlank(message = "Description is required")
        @Size(max = 5000, message = "Description must be at most 5000 characters")
        String description
) {
}
