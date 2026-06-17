package com.academy.tracker.repository;

import com.academy.tracker.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentId(Long studentId);
}