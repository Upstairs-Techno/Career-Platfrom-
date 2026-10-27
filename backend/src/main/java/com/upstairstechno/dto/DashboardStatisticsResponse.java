package com.upstairstechno.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatisticsResponse {
    private long totalOjtApplications;
    private long totalInternshipApplications;
    private long pendingApplications;
    private long selectedStudents;
    private long completedStudents;
    private long totalReferralCodes;
    private Map<String, Long> ojtStatusBreakdown;
    private Map<String, Long> internshipStatusBreakdown;
}
