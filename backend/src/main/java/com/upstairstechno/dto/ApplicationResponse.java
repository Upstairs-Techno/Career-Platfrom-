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
public class ApplicationResponse {
    private String applicationId;
    private String applicationType; // OJT or INTERNSHIP
    private ApplicationStatus status;
    private LocalDateTime submittedDate;
    private String studentName;
    private String referralMessage;
}
