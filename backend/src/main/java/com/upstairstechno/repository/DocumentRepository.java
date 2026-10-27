package com.upstairstechno.repository;

import com.upstairstechno.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationTypeAndApplicationId(String applicationType, String applicationId);
}
