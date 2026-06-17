package com.academy.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String githubUrl;

    private String deployedUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;

    private Integer grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}