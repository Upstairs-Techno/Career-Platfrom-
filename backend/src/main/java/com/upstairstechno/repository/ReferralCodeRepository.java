package com.upstairstechno.repository;

import com.upstairstechno.entity.ReferralCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReferralCodeRepository extends JpaRepository<ReferralCode, Long> {
    Optional<ReferralCode> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}
