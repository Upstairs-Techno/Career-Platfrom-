package com.upstairstechno.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReferralValidationResponse {
    private boolean valid;
    private String message;
}
