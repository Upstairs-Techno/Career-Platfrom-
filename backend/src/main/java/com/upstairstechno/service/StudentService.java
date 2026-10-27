package com.upstairstechno.service;

import com.upstairstechno.dto.StudentApplicationRequest;
import com.upstairstechno.entity.Student;
import com.upstairstechno.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    /** Reuses an existing student record (matched by email) or creates a new one. */
    public Student findOrCreate(StudentApplicationRequest request) {
        return studentRepository.findFirstByEmailIgnoreCase(request.getEmail())
                .map(existing -> {
                    existing.setName(request.getName());
                    existing.setMobile(request.getMobile());
                    existing.setGender(request.getGender());
                    existing.setCollege(request.getCollege());
                    existing.setCourse(request.getCourse());
                    existing.setYear(request.getYear());
                    return studentRepository.save(existing);
                })
                .orElseGet(() -> studentRepository.save(Student.builder()
                        .name(request.getName())
                        .mobile(request.getMobile())
                        .email(request.getEmail())
                        .gender(request.getGender())
                        .college(request.getCollege())
                        .course(request.getCourse())
                        .year(request.getYear())
                        .build()));
    }
}
