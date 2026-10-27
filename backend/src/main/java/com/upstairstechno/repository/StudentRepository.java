package com.upstairstechno.repository;

import com.upstairstechno.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findFirstByEmailIgnoreCase(String email);
    Optional<Student> findFirstByEmailIgnoreCaseAndMobile(String email, String mobile);
}
