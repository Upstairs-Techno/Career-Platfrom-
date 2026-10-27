package com.upstairstechno.controller;

import com.upstairstechno.dto.*;
import com.upstairstechno.exception.ResourceNotFoundException;
import com.upstairstechno.service.InternshipService;
import com.upstairstechno.service.OjtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApplicationController {

    private final OjtService ojtService;
    private final InternshipService internshipService;
    private final com.upstairstechno.service.ResumeStorageService resumeStorageService;

    @GetMapping("/ojt/applications")
    public ResponseEntity<List<ApplicationListItem>> listOjt(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String track,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ojtService.listAll(status, track, q));
    }

    @GetMapping("/internship/applications")
    public ResponseEntity<List<ApplicationListItem>> listInternship(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(internshipService.listAll(status, domain, q));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApplicationDetailResponse> getApplication(@PathVariable("id") String applicationId) {
        return ResponseEntity.ok(resolveDetail(applicationId));
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<ApplicationDetailResponse> updateStatus(@PathVariable("id") String applicationId,
                                                                    @Valid @RequestBody StatusUpdateRequest request,
                                                                    Authentication authentication) {
        String changedBy = authentication.getName();
        if (applicationId.startsWith("OJT")) {
            return ResponseEntity.ok(ojtService.updateStatus(applicationId, request, changedBy));
        } else if (applicationId.startsWith("INT")) {
            return ResponseEntity.ok(internshipService.updateStatus(applicationId, request, changedBy));
        }
        throw new ResourceNotFoundException("Application not found.");
    }

    @GetMapping("/applications/{id}/resume")
    public ResponseEntity<org.springframework.core.io.Resource> getResume(
            @PathVariable("id") String applicationId,
            @RequestParam(defaultValue = "false") boolean download) {
        String resumePath;
        String originalName;
        String contentType;

        if (applicationId.startsWith("OJT")) {
            com.upstairstechno.entity.OjtApplication app = ojtService.getEntityByApplicationId(applicationId);
            resumePath = app.getResumePath();
            originalName = app.getResumeFileName();
            contentType = app.getResumeContentType();
        } else if (applicationId.startsWith("INT")) {
            com.upstairstechno.entity.InternshipApplication app = internshipService.getEntityByApplicationId(applicationId);
            resumePath = app.getResumePath();
            originalName = app.getResumeFileName();
            contentType = app.getResumeContentType();
        } else {
            throw new ResourceNotFoundException("Application not found.");
        }

        if (resumePath == null || resumePath.isBlank()) {
            throw new ResourceNotFoundException("No resume uploaded for this application.");
        }

        org.springframework.core.io.Resource resource = resumeStorageService.loadAsResource(resumePath);

        if (originalName == null || originalName.isBlank()) {
            originalName = applicationId + "-resume";
        }
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String disposition = (download ? "attachment" : "inline") + "; filename=\"" + originalName + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(resource);
    }

    @GetMapping("/ojt/applications/export")
    public ResponseEntity<ByteArrayResource> exportOjt() {
        List<ApplicationListItem> items = ojtService.listAll(null, null, null);
        String csv = toCsv(items);
        return csvResponse(csv, "ojt-applications.csv");
    }

    @GetMapping("/internship/applications/export")
    public ResponseEntity<ByteArrayResource> exportInternship() {
        List<ApplicationListItem> items = internshipService.listAll(null, null, null);
        String csv = toCsv(items);
        return csvResponse(csv, "internship-applications.csv");
    }

    private ApplicationDetailResponse resolveDetail(String applicationId) {
        if (applicationId.startsWith("OJT")) {
            return ojtService.getByApplicationId(applicationId);
        } else if (applicationId.startsWith("INT")) {
            return internshipService.getByApplicationId(applicationId);
        }
        throw new ResourceNotFoundException("Application not found.");
    }

    private String toCsv(List<ApplicationListItem> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("Application ID,Student Name,Email,Phone,College,Course,Track/Domain,Duration,Mode,Referral Code,Resume Uploaded,Status,Submitted Date\n");
        for (ApplicationListItem item : items) {
            sb.append(csvSafe(item.getApplicationId())).append(",")
                    .append(csvSafe(item.getStudentName())).append(",")
                    .append(csvSafe(item.getEmail())).append(",")
                    .append(csvSafe(item.getPhone())).append(",")
                    .append(csvSafe(item.getCollege())).append(",")
                    .append(csvSafe(item.getCourse())).append(",")
                    .append(csvSafe(item.getTrackOrDomain())).append(",")
                    .append(csvSafe(item.getDuration())).append(",")
                    .append(csvSafe(item.getMode())).append(",")
                    .append(csvSafe(item.getReferralCode())).append(",")
                    .append(csvSafe(item.getHasResume() != null && item.getHasResume() ? "Yes (" + (item.getResumeFileName() != null ? item.getResumeFileName() : "Uploaded") + ")" : "No")).append(",")
                    .append(csvSafe(item.getStatus() != null ? item.getStatus().name() : "")).append(",")
                    .append(csvSafe(item.getSubmittedDate() != null ? item.getSubmittedDate().toString() : ""))
                    .append("\n");
        }
        return sb.toString();
    }

    private String csvSafe(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private ResponseEntity<ByteArrayResource> csvResponse(String csv, String filename) {
        ByteArrayResource resource = new ByteArrayResource(csv.getBytes(StandardCharsets.UTF_8));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
