package com.academy.tracker.dto;

import com.academy.tracker.entity.Submission;
import com.academy.tracker.entity.SubmissionStatus;

import java.time.LocalDateTime;

public record AdminSubmissionResponse(
        Long id,
        Long assignmentId,
        String assignmentTitle,
        Long studentId,
        String studentUsername,
        String githubUrl,
        String deployedUrl,
        String description,
        LocalDateTime submittedAt,
        SubmissionStatus status,
        Integer grade,
        String feedback
) {

    public static AdminSubmissionResponse from(
            Submission submission
    ) {
        return new AdminSubmissionResponse(
                submission.getId(),
                submission.getAssignment().getId(),
                submission.getAssignment().getTitle(),
                submission.getStudent().getId(),
                submission.getStudent().getUsername(),
                submission.getGithubUrl(),
                submission.getDeployedUrl(),
                submission.getDescription(),
                submission.getSubmittedAt(),
                submission.getStatus(),
                submission.getGrade(),
                submission.getFeedback()
        );
    }
}