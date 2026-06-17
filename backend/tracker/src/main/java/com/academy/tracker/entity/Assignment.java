package com.academy.tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Temporal(TemporalType.DATE)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date deadline;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Submission> submissions;
}