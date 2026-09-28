package com.academy.tracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EvaluateSubmissionRequest(

        @NotNull(message = "Grade is required")
        @Min(value = 2, message = "Grade cannot be lower than 2")
        @Max(value = 6, message = "Grade cannot be higher than 6")
        Integer grade,

        @NotBlank(message = "Feedback is required")
        @Size(
                max = 5000,
                message = "Feedback cannot exceed 5000 characters"
        )
        String feedback

) {
}