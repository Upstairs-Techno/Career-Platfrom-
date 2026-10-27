package com.upstairstechno.dto;

import com.upstairstechno.entity.InternshipDomain;
import com.upstairstechno.entity.TrainingMode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class InternshipApplicationRequest extends StudentApplicationRequest {

    @NotNull(message = "Internship duration is required")
    private Integer durationMonths;

    @NotNull(message = "Preferred mode is required")
    private TrainingMode mode;

    @NotNull(message = "Internship domain is required")
    private InternshipDomain domain;
}
