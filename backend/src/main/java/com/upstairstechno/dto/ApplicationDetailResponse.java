package com.upstairstechno.dto;

import com.upstairstechno.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationDetailResponse {
    private String applicationId;
    private String applicationType;
    private String name;
    private String mobile;
    private String email;
    private String gender;
    private String college;
    private String course;
    private String year;
    private String trackOrDomain;
    private Integer duration; // weeks (OJT) or months (Internship)
    private String mode;
    private String referralCode;
    private ApplicationStatus status;
    private String remarks;
    private Boolean hasResume;
    private String resumeFileName;
    private Long resumeFileSize;
    private LocalDateTime submittedDate;
    private List<StatusHistoryResponse> statusHistory;
}
