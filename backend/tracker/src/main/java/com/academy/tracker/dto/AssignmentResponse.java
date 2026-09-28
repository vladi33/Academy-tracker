package com.academy.tracker.dto;

import com.academy.tracker.entity.Assignment;

import java.time.LocalDate;

public record AssignmentResponse(Long id, String title, String description, LocalDate deadline) {
    public static AssignmentResponse from(Assignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDeadline()
        );
    }
}
