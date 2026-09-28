package com.academy.tracker.dto;

import com.academy.tracker.entity.Submission;

import java.time.LocalDateTime;

public record SubmissionResponse(
        Long id,
        AssignmentResponse assignment,
        UserSummaryResponse student,
        String githubUrl,
        String deployedUrl,
        String description,
        String status,
        Integer grade,
        String feedback,
        LocalDateTime submittedAt
) {
    public static SubmissionResponse from(Submission submission) {
        return new SubmissionResponse(
                submission.getId(),
                AssignmentResponse.from(submission.getAssignment()),
                UserSummaryResponse.from(submission.getStudent()),
                submission.getGithubUrl(),
                submission.getDeployedUrl(),
                submission.getDescription(),
                submission.getStatus().name(),
                submission.getGrade(),
                submission.getFeedback(),
                submission.getSubmittedAt()
        );
    }
}
