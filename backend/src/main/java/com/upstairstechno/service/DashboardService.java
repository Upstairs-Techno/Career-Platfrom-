package com.upstairstechno.service;

import com.upstairstechno.dto.DashboardStatisticsResponse;
import com.upstairstechno.entity.ApplicationStatus;
import com.upstairstechno.repository.InternshipApplicationRepository;
import com.upstairstechno.repository.OjtApplicationRepository;
import com.upstairstechno.repository.ReferralCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OjtApplicationRepository ojtApplicationRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;
    private final ReferralCodeRepository referralCodeRepository;

    public DashboardStatisticsResponse getStatistics() {
        long totalOjt = ojtApplicationRepository.count();
        long totalInternship = internshipApplicationRepository.count();

        long pending = ojtApplicationRepository.countByStatus(ApplicationStatus.SUBMITTED)
                + ojtApplicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW)
                + internshipApplicationRepository.countByStatus(ApplicationStatus.SUBMITTED)
                + internshipApplicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW);

        long selected = ojtApplicationRepository.countByStatus(ApplicationStatus.SELECTED)
                + internshipApplicationRepository.countByStatus(ApplicationStatus.SELECTED);

        long completed = ojtApplicationRepository.countByStatus(ApplicationStatus.COMPLETED)
                + internshipApplicationRepository.countByStatus(ApplicationStatus.COMPLETED);

        Map<String, Long> ojtBreakdown = new LinkedHashMap<>();
        Map<String, Long> internshipBreakdown = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            ojtBreakdown.put(status.name(), ojtApplicationRepository.countByStatus(status));
            internshipBreakdown.put(status.name(), internshipApplicationRepository.countByStatus(status));
        }

        return DashboardStatisticsResponse.builder()
                .totalOjtApplications(totalOjt)
                .totalInternshipApplications(totalInternship)
                .pendingApplications(pending)
                .selectedStudents(selected)
                .completedStudents(completed)
                .totalReferralCodes(referralCodeRepository.count())
                .ojtStatusBreakdown(ojtBreakdown)
                .internshipStatusBreakdown(internshipBreakdown)
                .build();
    }
}
