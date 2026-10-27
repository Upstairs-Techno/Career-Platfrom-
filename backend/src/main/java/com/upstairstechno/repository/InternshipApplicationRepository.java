package com.upstairstechno.repository;

import com.upstairstechno.entity.ApplicationStatus;
import com.upstairstechno.entity.InternshipApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long>, JpaSpecificationExecutor<InternshipApplication> {
    Optional<InternshipApplication> findByApplicationId(String applicationId);
    long countByStatus(ApplicationStatus status);
    long countByReferralCode_Id(Long referralCodeId);
    boolean existsByStudent_EmailIgnoreCaseAndStatusNotIn(String email, java.util.Collection<ApplicationStatus> excludedStatuses);
}
