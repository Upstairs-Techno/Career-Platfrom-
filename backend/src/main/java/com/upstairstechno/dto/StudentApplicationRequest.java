package com.upstairstechno.dto;

import com.upstairstechno.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StudentApplicationRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, message = "Name must be at least 2 characters")
    private String name;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid Indian mobile number")
    private String mobile;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "College / University name is required")
    private String college;

    @NotBlank(message = "Course is required")
    private String course;

    private String year;

    private String referralCode;
}
