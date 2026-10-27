package com.upstairstechno.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_status_history", indexes = {
        @Index(name = "idx_history_app", columnList = "application_type, application_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** "OJT" or "INTERNSHIP" */
    @Column(name = "application_type", nullable = false, length = 20)
    private String applicationType;

    /** human-readable application id, e.g. OJT-2026-00001 */
    @Column(name = "application_id", nullable = false, length = 30)
    private String applicationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private ApplicationStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 20)
    private ApplicationStatus newStatus;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
