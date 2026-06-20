package com.academy.tracker.controller;

import com.academy.tracker.entity.Submission;
import com.academy.tracker.entity.User;
import com.academy.tracker.repository.SubmissionRepository;
import com.academy.tracker.repository.UserRepository;
import com.academy.tracker.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<?> getAllSubmissions(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String role = jwtUtils.getRoleFromJwtToken(jwt);

        if (!"INSTRUCTOR".equals(role)) {
            return ResponseEntity.status(403).body("Error: Only teachers have access to the list!");
        }
        return ResponseEntity.ok(submissionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> submitProject(@RequestHeader("Authorization") String token, @RequestBody Submission submission) {
        try {
            // 1. Взимаме името на студента от криптирания токен
            String jwt = token.substring(7);
            String username = jwtUtils.getUserNameFromJwtToken(jwt);

            // 2. Намираме пълния потребител (заедно с ID-то му) от базата
            Optional<User> studentOpt = userRepository.findByUsername(username);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Student not found in database!");
            }

            // 3. Свързваме го с предавания проект
            submission.setStudent(studentOpt.get());
            submission.setStatus("PENDING");

            return ResponseEntity.ok(submissionRepository.save(submission));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing submission: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/evaluate")
    public ResponseEntity<?> evaluateSubmission(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody Submission evaluationData) {
        String jwt = token.substring(7);
        String role = jwtUtils.getRoleFromJwtToken(jwt);

        if (!"INSTRUCTOR".equals(role)) {
            return ResponseEntity.status(403).body("Error: You do not have rating rights!");
        }

        return submissionRepository.findById(id).map(submission -> {
            submission.setStatus("EVALUATED");
            submission.setGrade(evaluationData.getGrade());
            submission.setFeedback(evaluationData.getFeedback());
            submissionRepository.save(submission);
            return ResponseEntity.ok("The project has been successfully evaluated!");
        }).orElse(ResponseEntity.notFound().build());
    }
}