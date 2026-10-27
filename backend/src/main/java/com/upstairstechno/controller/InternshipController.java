package com.upstairstechno.controller;

import com.upstairstechno.dto.ApplicationDetailResponse;
import com.upstairstechno.dto.ApplicationResponse;
import com.upstairstechno.dto.InternshipApplicationRequest;
import com.upstairstechno.entity.InternshipDomain;
import com.upstairstechno.entity.TrainingMode;
import com.upstairstechno.service.InternshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internships")
@RequiredArgsConstructor
public class InternshipController {

    private final InternshipService internshipService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> programInfo() {
        return ResponseEntity.ok(Map.of(
                "durations", List.of(1, 2, 3, 6),
                "modes", TrainingMode.values(),
                "domains", InternshipDomain.values()
        ));
    }

    @GetMapping("/domains")
    public ResponseEntity<InternshipDomain[]> domains() {
        return ResponseEntity.ok(InternshipDomain.values());
    }

    @PostMapping(value = "/applications", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApplicationResponse> applyJson(@Valid @RequestBody InternshipApplicationRequest request) {
        ApplicationResponse response = internshipService.apply(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/applications", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponse> applyMultipart(
            @Valid @ModelAttribute InternshipApplicationRequest request,
            @RequestParam(value = "resume", required = false) org.springframework.web.multipart.MultipartFile resume) {
        ApplicationResponse response = internshipService.apply(request, resume);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApplicationDetailResponse> getApplication(@PathVariable("id") String applicationId) {
        return ResponseEntity.ok(internshipService.getByApplicationId(applicationId));
    }
}
