package com.upstairstechno.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReferralCodeRequest {
    @NotBlank(message = "Marketing team member name is required")
    private String memberName;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String code; // optional - auto-generated if blank

    private String description;

    @Positive(message = "Maximum uses must be positive")
    private Integer maxUses = 100;

    private LocalDateTime expiresAt;

    private Boolean active = true;
}
