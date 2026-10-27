package com.upstairstechno.repository;

import com.upstairstechno.entity.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {
    List<ApplicationStatusHistory> findByApplicationTypeAndApplicationIdOrderByChangedAtAsc(String applicationType, String applicationId);
}
