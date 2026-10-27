package com.upstairstechno.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "referral_codes", uniqueConstraints = {
        @UniqueConstraint(columnNames = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "member_name", length = 150)
    private String memberName;

    @Column(name = "mobile_number", length = 25)
    private String mobileNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(length = 500)
    private String description;

    @Column(name = "max_uses", nullable = false)
    @Builder.Default
    private Integer maxUses = 100;

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean active = true;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isUsable() {
        if (!active) return false;
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) return false;
        return usedCount < maxUses;
    }
}
