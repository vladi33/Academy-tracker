package com.academy.tracker.controller;

import com.academy.tracker.dto.AssignmentResponse;
import com.academy.tracker.dto.CreateAssignmentRequest;
import com.academy.tracker.entity.Assignment;
import com.academy.tracker.repository.AssignmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;

    public AssignmentController(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @GetMapping
    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAllByOrderByDeadlineAsc().stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request
    ) {
        Assignment assignment = new Assignment();
        assignment.setTitle(request.title().trim());
        assignment.setDescription(request.description().trim());
        assignment.setDeadline(request.deadline());

        Assignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.status(HttpStatus.CREATED).body(AssignmentResponse.from(saved));
    }
}
