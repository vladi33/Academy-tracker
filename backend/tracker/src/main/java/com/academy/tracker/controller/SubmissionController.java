package com.academy.tracker.controller;

import com.academy.tracker.dto.CreateSubmissionRequest;
import com.academy.tracker.dto.EvaluateSubmissionRequest;
import com.academy.tracker.dto.SubmissionResponse;
import com.academy.tracker.entity.Assignment;
import com.academy.tracker.entity.Submission;
import com.academy.tracker.entity.SubmissionStatus;
import com.academy.tracker.entity.User;
import com.academy.tracker.entity.UserRole;
import com.academy.tracker.repository.AssignmentRepository;
import com.academy.tracker.repository.SubmissionRepository;
import com.academy.tracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final ZoneId applicationZoneId;

    public SubmissionController(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            AssignmentRepository assignmentRepository,
            @Value("${app.time-zone}") String applicationTimeZone
    ) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.applicationZoneId = ZoneId.of(applicationTimeZone);
    }

    @GetMapping
    public List<SubmissionResponse> getSubmissions(
            Authentication authentication
    ) {
        boolean instructor = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_INSTRUCTOR")
                );

        List<Submission> submissions = instructor
                ? submissionRepository.findAllByOrderBySubmittedAtDesc()
                : submissionRepository
                .findByStudentUsernameOrderBySubmittedAtDesc(
                        authentication.getName()
                );

        return submissions.stream()
                .map(SubmissionResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> submitProject(
            Authentication authentication,
            @Valid @RequestBody CreateSubmissionRequest request
    ) {
        User student = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found"
                ));

        if (student.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can submit projects"
            );
        }

        Assignment assignment = assignmentRepository
                .findById(request.assignmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assignment was not found"
                ));

        LocalDate today = LocalDate.now(applicationZoneId);

        if (today.isAfter(assignment.getDeadline())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The deadline for this assignment has passed."
            );
        }

        boolean alreadySubmitted =
                submissionRepository.existsByAssignmentIdAndStudentId(
                        assignment.getId(),
                        student.getId()
                );

        if (alreadySubmitted) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already submitted this assignment"
            );
        }

        Submission submission = new Submission();

        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setGithubUrl(request.githubUrl().trim());
        submission.setDeployedUrl(
                normalizeOptional(request.deployedUrl())
        );
        submission.setDescription(request.description().trim());
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setGrade(null);
        submission.setFeedback(null);

        Submission savedSubmission =
                submissionRepository.save(submission);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SubmissionResponse.from(savedSubmission));
    }

    @Transactional
    @PutMapping("/{id}/evaluate")
    public ResponseEntity<Void> evaluateSubmission(
            @PathVariable Long id,
            @Valid @RequestBody EvaluateSubmissionRequest request
    ) {
        Submission submission = submissionRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Submission was not found"
                ));

        submission.setStatus(SubmissionStatus.EVALUATED);
        submission.setGrade(request.grade());
        submission.setFeedback(request.feedback().trim());

        submissionRepository.saveAndFlush(submission);

        return ResponseEntity.noContent().build();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}