package com.academy.tracker.controller;

import com.academy.tracker.entity.Assignment;
import com.academy.tracker.repository.AssignmentRepository;
import com.academy.tracker.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private JwtUtils jwtUtils;


    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentRepository.findAll());
    }


    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestHeader("Authorization") String token, @RequestBody Assignment assignment) {
        String jwt = token.substring(7);
        String role = jwtUtils.getRoleFromJwtToken(jwt);

        if (!"INSTRUCTOR".equals(role)) {
            return ResponseEntity.status(403).body("Error: You do not have Teacher rights!");
        }

        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }
}