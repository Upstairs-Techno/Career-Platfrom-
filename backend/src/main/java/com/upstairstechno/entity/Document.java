package com.upstairstechno.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Stores document METADATA only (offer letters, certificates, project reports, etc).
 * Actual file bytes are intended to live in external storage (S3 / Cloudinary /
 * Supabase Storage) — only the resulting URL/key is persisted here.
 */
@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** "OJT" or "INTERNSHIP" */
    @Column(name = "application_type", nullable = false, length = 20)
    private String applicationType;

    @Column(name = "application_id", nullable = false, length = 30)
    private String applicationId;

    /** e.g. OFFER_LETTER, JOINING_LETTER, COMPLETION_CERTIFICATE, COMPLETION_LETTER, PROJECT_REPORT */
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "file_name", length = 255)
    private String fileName;

    /** URL/key pointing at external storage (S3/Cloudinary/Supabase) */
    @Column(name = "storage_url", length = 1000)
    private String storageUrl;

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
