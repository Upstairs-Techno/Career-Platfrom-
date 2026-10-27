package com.upstairstechno.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReferralValidationRequest {
    @NotBlank(message = "Referral code is required")
    private String code;
}
