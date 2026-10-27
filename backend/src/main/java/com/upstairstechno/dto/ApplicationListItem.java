package com.upstairstechno.dto;

import com.upstairstechno.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationListItem {
    private String applicationId;
    private String studentName;
    private String email;
    private String phone;
    private String college;
    private String course;
    private String trackOrDomain;
    private String duration;
    private String mode;
    private String referralCode;
    private Boolean hasResume;
    private String resumeFileName;
    private ApplicationStatus status;
    private LocalDateTime submittedDate;
}
