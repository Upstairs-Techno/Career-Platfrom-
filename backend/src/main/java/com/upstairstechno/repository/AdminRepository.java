package com.upstairstechno.repository;

import com.upstairstechno.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByLoginIdAndActiveTrue(String loginId);
    boolean existsByLoginId(String loginId);
}
