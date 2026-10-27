package com.upstairstechno.service;

import com.upstairstechno.dto.AdminLoginRequest;
import com.upstairstechno.dto.AdminLoginResponse;
import com.upstairstechno.entity.Admin;
import com.upstairstechno.exception.UnauthorizedException;
import com.upstairstechno.repository.AdminRepository;
import com.upstairstechno.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminLoginResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByLoginIdAndActiveTrue(request.getLoginId())
                .orElseThrow(() -> new UnauthorizedException("Invalid login ID or password."));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid login ID or password.");
        }

        String token = jwtUtil.generateToken(admin.getLoginId(), admin.getId(), admin.getRole());

        return new AdminLoginResponse(
                token,
                new AdminLoginResponse.AdminSummary(admin.getId(), admin.getLoginId(), admin.getName())
        );
    }

    public Admin getByLoginId(String loginId) {
        return adminRepository.findByLoginIdAndActiveTrue(loginId)
                .orElseThrow(() -> new UnauthorizedException("Admin not found."));
    }
}
