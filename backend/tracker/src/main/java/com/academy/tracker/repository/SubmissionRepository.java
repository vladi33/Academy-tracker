package com.academy.tracker.repository;

import com.academy.tracker.entity.Submission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    @Override
    @EntityGraph(attributePaths = {"assignment", "student"})
    Optional<Submission> findById(Long id);

    @EntityGraph(attributePaths = {"assignment", "student"})
    List<Submission> findAllByOrderBySubmittedAtDesc();

    @EntityGraph(attributePaths = {"assignment", "student"})
    List<Submission> findByStudentUsernameOrderBySubmittedAtDesc(
            String username
    );

    boolean existsByAssignmentIdAndStudentId(
            Long assignmentId,
            Long studentId
    );

    long countByAssignmentId(Long assignmentId);

    long countByStudentId(Long studentId);
}