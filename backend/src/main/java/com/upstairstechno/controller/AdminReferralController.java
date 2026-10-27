package com.upstairstechno.controller;

import com.upstairstechno.dto.ReferralCodeRequest;
import com.upstairstechno.dto.ReferralCodeResponse;
import com.upstairstechno.service.ReferralService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/referrals")
@RequiredArgsConstructor
public class AdminReferralController {

    private final ReferralService referralService;

    @GetMapping
    public ResponseEntity<List<ReferralCodeResponse>> listAll() {
        return ResponseEntity.ok(referralService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReferralCodeResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(referralService.getOne(id));
    }

    @PostMapping
    public ResponseEntity<ReferralCodeResponse> create(@Valid @RequestBody ReferralCodeRequest request,
                                                         Authentication authentication) {
        ReferralCodeResponse created = referralService.create(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReferralCodeResponse> update(@PathVariable Long id, @Valid @RequestBody ReferralCodeRequest request) {
        return ResponseEntity.ok(referralService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        referralService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
