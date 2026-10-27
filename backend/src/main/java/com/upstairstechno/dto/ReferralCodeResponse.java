package com.upstairstechno.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReferralCodeResponse {
    private Long id;
    private String code;
    private String memberName;
    private String mobileNumber;
    private String email;
    private String gender;
    private String description;
    private Integer maxUses;
    private Integer usedCount;
    private Integer remainingUses;
    private LocalDateTime expiresAt;
    private boolean active;
    private String createdBy;
    private LocalDateTime createdAt;
    private long ojtApplications;
    private long internshipApplications;
}
