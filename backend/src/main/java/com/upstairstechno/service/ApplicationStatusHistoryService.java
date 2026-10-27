package com.upstairstechno.service;

import com.upstairstechno.dto.StatusHistoryResponse;
import com.upstairstechno.entity.ApplicationStatus;
import com.upstairstechno.entity.ApplicationStatusHistory;
import com.upstairstechno.repository.ApplicationStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationStatusHistoryService {

    private final ApplicationStatusHistoryRepository historyRepository;

    public void record(String applicationType, String applicationId, ApplicationStatus oldStatus,
                        ApplicationStatus newStatus, String remarks, String changedBy) {
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .applicationType(applicationType)
                .applicationId(applicationId)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .remarks(remarks)
                .changedBy(changedBy)
                .build();
        historyRepository.save(history);
    }

    public List<StatusHistoryResponse> getHistory(String applicationType, String applicationId) {
        return historyRepository.findByApplicationTypeAndApplicationIdOrderByChangedAtAsc(applicationType, applicationId)
                .stream()
                .map(h -> StatusHistoryResponse.builder()
                        .oldStatus(h.getOldStatus())
                        .newStatus(h.getNewStatus())
                        .remarks(h.getRemarks())
                        .changedBy(h.getChangedBy())
                        .changedAt(h.getChangedAt())
                        .build())
                .toList();
    }
}
