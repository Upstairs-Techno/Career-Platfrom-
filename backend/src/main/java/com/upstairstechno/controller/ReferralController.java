package com.upstairstechno.controller;

import com.upstairstechno.dto.ReferralValidationRequest;
import com.upstairstechno.dto.ReferralValidationResponse;
import com.upstairstechno.service.ReferralService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @PostMapping("/validate")
    public ResponseEntity<ReferralValidationResponse> validate(@Valid @RequestBody ReferralValidationRequest request) {
        return ResponseEntity.ok(referralService.validate(request.getCode()));
    }
}
