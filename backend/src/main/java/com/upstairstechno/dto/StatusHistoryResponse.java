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
public class StatusHistoryResponse {
    private ApplicationStatus oldStatus;
    private ApplicationStatus newStatus;
    private String remarks;
    private String changedBy;
    private LocalDateTime changedAt;
}
