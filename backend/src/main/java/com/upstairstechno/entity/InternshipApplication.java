package com.upstairstechno.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "internship_applications", uniqueConstraints = {
        @UniqueConstraint(columnNames = "application_id")
}, indexes = {
        @Index(name = "idx_internship_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false, length = 30)
    private String applicationId;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TrainingMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private InternshipDomain domain;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "referral_code_id")
    private ReferralCode referralCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "resume_path", length = 500)
    private String resumePath;

    @Column(name = "resume_file_name", length = 255)
    private String resumeFileName;

    @Column(name = "resume_content_type", length = 100)
    private String resumeContentType;

    @Column(name = "resume_file_size")
    private Long resumeFileSize;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.applicationId == null || this.applicationId.isBlank()) {
            this.applicationId = "TEMP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
