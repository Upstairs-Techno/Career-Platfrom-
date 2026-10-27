package com.upstairstechno.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminLoginResponse {
    private String token;
    private AdminSummary admin;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminSummary {
        private Long id;
        private String loginId;
        private String name;
    }
}
