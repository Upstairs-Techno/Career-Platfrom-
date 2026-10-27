package com.upstairstechno.dto;

import com.upstairstechno.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull(message = "New status is required")
    private ApplicationStatus status;

    private String remarks;
}
