package com.academy.tracker.dto;

import com.academy.tracker.entity.Assignment;

import java.time.LocalDate;

public record AdminAssignmentResponse(
        Long id,
        String title,
        String description,
        LocalDate deadline,
        long submissionCount
) {

    public static AdminAssignmentResponse from(
            Assignment assignment,
            long submissionCount
    ) {
        return new AdminAssignmentResponse(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDeadline(),
                submissionCount
        );
    }
}