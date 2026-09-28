package com.academy.tracker.controller;

import com.academy.tracker.dto.AdminAssignmentResponse;
import com.academy.tracker.dto.UpdateUserRoleRequest;
import com.academy.tracker.dto.UserSummaryResponse;
import com.academy.tracker.entity.Assignment;
import com.academy.tracker.entity.User;
import com.academy.tracker.entity.UserRole;
import com.academy.tracker.repository.AssignmentRepository;
import com.academy.tracker.repository.SubmissionRepository;
import com.academy.tracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.academy.tracker.dto.AdminSubmissionResponse;
import com.academy.tracker.entity.Submission;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public AdminController(
            UserRepository userRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository
    ) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping("/users")
    public List<UserSummaryResponse> getUsers() {
        return userRepository
                .findAll(
                        Sort.by(
                                Sort.Direction.ASC,
                                "username"
                        )
                )
                .stream()
                .map(UserSummaryResponse::from)
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public UserSummaryResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Authentication authentication
    ) {
        User user = findUser(id);

        if (user.getUsername().equals(authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot change your own administrator role"
            );
        }

        UserRole newRole =
                parseAssignableRole(request.role());

        user.setRole(newRole);

        User updatedUser =
                userRepository.save(user);

        return UserSummaryResponse.from(updatedUser);
    }

    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = findUser(id);

        if (user.getUsername().equals(authentication.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot delete your own administrator account"
            );
        }

        if (user.getRole() == UserRole.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Administrator accounts cannot be deleted"
            );
        }

        long submissionCount =
                submissionRepository.countByStudentId(user.getId());

        if (submissionCount > 0) {
            String submissionLabel =
                    submissionCount == 1
                            ? "submission"
                            : "submissions";

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User cannot be deleted because they have "
                            + submissionCount
                            + " "
                            + submissionLabel
                            + ". Delete the submissions first."
            );
        }

        try {
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User cannot be deleted because related records still exist",
                    exception
            );
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments")
    public List<AdminAssignmentResponse> getAssignments() {
        return assignmentRepository
                .findAllByOrderByDeadlineAsc()
                .stream()
                .map(assignment ->
                        AdminAssignmentResponse.from(
                                assignment,
                                submissionRepository.countByAssignmentId(
                                        assignment.getId()
                                )
                        )
                )
                .toList();
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id
    ) {
        Assignment assignment =
                assignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Assignment was not found"
                                )
                        );

        long submissionCount =
                submissionRepository.countByAssignmentId(id);

        if (submissionCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Assignment cannot be deleted while it has submissions"
            );
        }

        assignmentRepository.delete(assignment);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/submissions")
    public List<AdminSubmissionResponse> getSubmissions() {
        return submissionRepository
                .findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(AdminSubmissionResponse::from)
                .toList();
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable Long id
    ) {
        Submission submission =
                submissionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Submission was not found"
                                )
                        );

        submissionRepository.delete(submission);

        return ResponseEntity.noContent().build();
    }

    private User findUser(Long id) {
        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User was not found"
                        )
                );
    }

    private UserRole parseAssignableRole(
            String roleValue
    ) {
        UserRole role;

        try {
            role = UserRole.valueOf(
                    roleValue
                            .trim()
                            .toUpperCase(Locale.ROOT)
            );
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Role must be STUDENT or INSTRUCTOR"
            );
        }

        if (role == UserRole.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The ADMIN role cannot be assigned through this endpoint"
            );
        }

        return role;
    }
}