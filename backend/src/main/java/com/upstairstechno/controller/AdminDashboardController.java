package com.upstairstechno.controller;

import com.upstairstechno.dto.DashboardStatisticsResponse;
import com.upstairstechno.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    public ResponseEntity<DashboardStatisticsResponse> statistics() {
        return ResponseEntity.ok(dashboardService.getStatistics());
    }

    @GetMapping("/application-summary")
    public ResponseEntity<DashboardStatisticsResponse> applicationSummary() {
        // Same underlying data - kept as a separate endpoint per the API spec
        // so the frontend can evolve it independently (e.g. trend data later).
        return ResponseEntity.ok(dashboardService.getStatistics());
    }
}
