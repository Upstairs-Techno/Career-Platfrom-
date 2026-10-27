package com.upstairstechno.controller;

import com.upstairstechno.dto.AdminLoginRequest;
import com.upstairstechno.dto.AdminLoginResponse;
import com.upstairstechno.entity.Admin;
import com.upstairstechno.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminAuthService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT - client discards the token. Endpoint kept for API completeness
        // and to support future token-blacklisting if needed.
        return ResponseEntity.ok().build();
    }

}
