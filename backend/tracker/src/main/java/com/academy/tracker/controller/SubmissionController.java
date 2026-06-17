package com.academy.tracker.controller;

import com.academy.tracker.entity.Submission;
import com.academy.tracker.repository.SubmissionRepository;
import com.academy.tracker.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionRepository submissionRepository;

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
    public ResponseEntity<Submission> submitProject(@RequestBody Submission submission) {
        submission.setStatus("PENDING");
        return ResponseEntity.ok(submissionRepository.save(submission));
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











