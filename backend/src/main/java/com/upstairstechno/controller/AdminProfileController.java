package com.upstairstechno.controller;

import com.upstairstechno.dto.AdminLoginResponse;
import com.upstairstechno.entity.Admin;
import com.upstairstechno.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminProfileController {

    private final AdminAuthService adminAuthService;

    @GetMapping("/profile")
    public ResponseEntity<AdminLoginResponse.AdminSummary> profile(Authentication authentication) {
        Admin admin = adminAuthService.getByLoginId(authentication.getName());
        return ResponseEntity.ok(new AdminLoginResponse.AdminSummary(admin.getId(), admin.getLoginId(), admin.getName()));
    }
}
