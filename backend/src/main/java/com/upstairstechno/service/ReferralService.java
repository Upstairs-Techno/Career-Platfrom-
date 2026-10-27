package com.upstairstechno.service;

import com.upstairstechno.dto.ReferralCodeRequest;
import com.upstairstechno.dto.ReferralCodeResponse;
import com.upstairstechno.dto.ReferralValidationResponse;
import com.upstairstechno.entity.ReferralCode;
import com.upstairstechno.exception.BadRequestException;
import com.upstairstechno.exception.ResourceNotFoundException;
import com.upstairstechno.repository.InternshipApplicationRepository;
import com.upstairstechno.repository.OjtApplicationRepository;
import com.upstairstechno.repository.ReferralCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReferralService {

    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ReferralCodeRepository referralCodeRepository;
    private final OjtApplicationRepository ojtApplicationRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;

    public ReferralValidationResponse validate(String code) {
        if (code == null || code.isBlank()) {
            return new ReferralValidationResponse(false, "Invalid referral code.");
        }
        Optional<ReferralCode> found = referralCodeRepository.findByCodeIgnoreCase(code.trim());
        if (found.isEmpty() || !found.get().isUsable()) {
            return new ReferralValidationResponse(false, "Invalid referral code.");
        }
        return new ReferralValidationResponse(true, "Referral code applied successfully.");
    }

    /** Returns the referral code entity if a valid, usable code string is supplied; null if blank. */
    public ReferralCode resolveForApplication(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        ReferralCode referralCode = referralCodeRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BadRequestException("Invalid referral code."));
        if (!referralCode.isUsable()) {
            throw new BadRequestException("This referral code is invalid or inactive.");
        }
        return referralCode;
    }

    @Transactional
    public void incrementUsage(ReferralCode referralCode) {
        if (referralCode == null) return;
        referralCode.setUsedCount(referralCode.getUsedCount() + 1);
        referralCodeRepository.save(referralCode);
    }

    @Transactional
    public ReferralCodeResponse create(ReferralCodeRequest request, String createdBy) {
        String code = (request.getCode() == null || request.getCode().isBlank())
                ? generateUniqueCode()
                : request.getCode().trim().toUpperCase();

        if (referralCodeRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("This referral code already exists.");
        }

        ReferralCode referralCode = ReferralCode.builder()
                .code(code)
                .memberName(request.getMemberName())
                .mobileNumber(request.getMobileNumber())
                .email(request.getEmail())
                .gender(request.getGender())
                .description(request.getDescription())
                .maxUses(request.getMaxUses() != null ? request.getMaxUses() : 100)
                .usedCount(0)
                .expiresAt(request.getExpiresAt())
                .active(request.getActive() == null || request.getActive())
                .createdBy(createdBy)
                .build();

        referralCode = referralCodeRepository.save(referralCode);
        return toResponse(referralCode);
    }

    @Transactional
    public ReferralCodeResponse update(Long id, ReferralCodeRequest request) {
        ReferralCode referralCode = referralCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Referral code not found."));

        if (request.getCode() != null && !request.getCode().isBlank()) {
            String newCode = request.getCode().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(referralCode.getCode())
                    && referralCodeRepository.existsByCodeIgnoreCase(newCode)) {
                throw new BadRequestException("This referral code already exists.");
            }
            referralCode.setCode(newCode);
        }
        if (request.getMemberName() != null) referralCode.setMemberName(request.getMemberName());
        if (request.getMobileNumber() != null) referralCode.setMobileNumber(request.getMobileNumber());
        if (request.getEmail() != null) referralCode.setEmail(request.getEmail());
        if (request.getGender() != null) referralCode.setGender(request.getGender());
        if (request.getDescription() != null) referralCode.setDescription(request.getDescription());
        if (request.getMaxUses() != null) referralCode.setMaxUses(request.getMaxUses());
        referralCode.setExpiresAt(request.getExpiresAt());
        if (request.getActive() != null) referralCode.setActive(request.getActive());

        referralCode = referralCodeRepository.save(referralCode);
        return toResponse(referralCode);
    }

    @Transactional
    public void delete(Long id) {
        ReferralCode referralCode = referralCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Referral code not found."));
        if (referralCode.getUsedCount() > 0) {
            throw new BadRequestException("Cannot delete a referral code that has already been used. Deactivate it instead.");
        }
        referralCodeRepository.delete(referralCode);
    }

    public List<ReferralCodeResponse> listAll() {
        return referralCodeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ReferralCodeResponse getOne(Long id) {
        ReferralCode referralCode = referralCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Referral code not found."));
        return toResponse(referralCode);
    }

    private ReferralCodeResponse toResponse(ReferralCode rc) {
        long ojtCount = ojtApplicationRepository.countByReferralCode_Id(rc.getId());
        long internshipCount = internshipApplicationRepository.countByReferralCode_Id(rc.getId());
        return ReferralCodeResponse.builder()
                .id(rc.getId())
                .code(rc.getCode())
                .memberName(rc.getMemberName())
                .mobileNumber(rc.getMobileNumber())
                .email(rc.getEmail())
                .gender(rc.getGender())
                .description(rc.getDescription())
                .maxUses(rc.getMaxUses())
                .usedCount(rc.getUsedCount())
                .remainingUses(Math.max(0, rc.getMaxUses() - rc.getUsedCount()))
                .expiresAt(rc.getExpiresAt())
                .active(rc.isActive())
                .createdBy(rc.getCreatedBy())
                .createdAt(rc.getCreatedAt())
                .ojtApplications(ojtCount)
                .internshipApplications(internshipCount)
                .build();
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("UPTECH");
            for (int i = 0; i < 4; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            code = sb.toString();
        } while (referralCodeRepository.existsByCodeIgnoreCase(code));
        return code;
    }
}
