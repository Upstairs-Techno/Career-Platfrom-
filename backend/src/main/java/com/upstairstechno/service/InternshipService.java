package com.upstairstechno.service;

import com.upstairstechno.dto.*;
import com.upstairstechno.entity.*;
import com.upstairstechno.exception.DuplicateApplicationException;
import com.upstairstechno.exception.ResourceNotFoundException;
import com.upstairstechno.repository.InternshipApplicationRepository;
import com.upstairstechno.util.ApplicationIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternshipService {

    private static final Set<ApplicationStatus> NON_BLOCKING_STATUSES =
            EnumSet.of(ApplicationStatus.REJECTED, ApplicationStatus.CANCELLED, ApplicationStatus.COMPLETED);

    private final InternshipApplicationRepository internshipApplicationRepository;
    private final StudentService studentService;
    private final ReferralService referralService;
    private final ApplicationStatusHistoryService historyService;
    private final MailService mailService;
    private final ResumeStorageService resumeStorageService;
    private final com.upstairstechno.repository.DocumentRepository documentRepository;

    @Transactional
    public ApplicationResponse apply(InternshipApplicationRequest request) {
        return apply(request, null);
    }

    @Transactional
    public ApplicationResponse apply(InternshipApplicationRequest request, org.springframework.web.multipart.MultipartFile resume) {
        if (internshipApplicationRepository.existsByStudent_EmailIgnoreCaseAndStatusNotIn(request.getEmail(), NON_BLOCKING_STATUSES)) {
            throw new DuplicateApplicationException("An application with these details already exists.");
        }

        ReferralCode referralCode = referralService.resolveForApplication(request.getReferralCode());
        Student student = studentService.findOrCreate(request);

        String tempId = "TEMP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        InternshipApplication application = InternshipApplication.builder()
                .applicationId(tempId)
                .student(student)
                .durationMonths(request.getDurationMonths())
                .mode(request.getMode())
                .domain(request.getDomain())
                .referralCode(referralCode)
                .status(ApplicationStatus.SUBMITTED)
                .build();

        application = internshipApplicationRepository.saveAndFlush(application);
        application.setApplicationId(ApplicationIdGenerator.generate("INT", application.getId()));

        if (resume != null && !resume.isEmpty()) {
            ResumeStorageService.StoredResume stored = resumeStorageService.storeResume(application.getApplicationId(), resume);
            if (stored != null) {
                application.setResumePath(stored.getStoredPath());
                application.setResumeFileName(stored.getOriginalFileName());
                application.setResumeContentType(stored.getContentType());
                application.setResumeFileSize(stored.getFileSize());

                documentRepository.save(Document.builder()
                        .applicationType("INTERNSHIP")
                        .applicationId(application.getApplicationId())
                        .documentType("RESUME")
                        .fileName(stored.getOriginalFileName())
                        .storageUrl(stored.getStoredPath())
                        .uploadedBy(student.getEmail())
                        .build());
            }
        }

        application = internshipApplicationRepository.save(application);

        if (referralCode != null) {
            referralService.incrementUsage(referralCode);
        }

        historyService.record("INTERNSHIP", application.getApplicationId(), null, ApplicationStatus.SUBMITTED,
                "Application submitted", "SYSTEM");

        mailService.sendApplicationReceived(student.getEmail(), student.getName(), application.getApplicationId(), "Internship");

        String referralMessage = request.getReferralCode() != null && !request.getReferralCode().isBlank()
                ? "Referral code applied successfully."
                : null;

        return ApplicationResponse.builder()
                .applicationId(application.getApplicationId())
                .applicationType("INTERNSHIP")
                .status(application.getStatus())
                .submittedDate(application.getCreatedAt())
                .studentName(student.getName())
                .referralMessage(referralMessage)
                .build();
    }

    @Transactional(readOnly = true)
    public ApplicationDetailResponse getByApplicationId(String applicationId) {
        InternshipApplication app = internshipApplicationRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));
        return toDetail(app);
    }

    @Transactional(readOnly = true)
    public List<ApplicationListItem> listAll(String status, String domain, String q) {
        Specification<InternshipApplication> spec = Specification.where(null);

        if (status != null && !status.isBlank()) {
            ApplicationStatus st = ApplicationStatus.valueOf(status.toUpperCase());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), st));
        }
        if (domain != null && !domain.isBlank()) {
            InternshipDomain d = InternshipDomain.valueOf(domain.toUpperCase());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("domain"), d));
        }
        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("applicationId")), like),
                    cb.like(cb.lower(root.get("student").get("name")), like),
                    cb.like(cb.lower(root.get("student").get("email")), like),
                    cb.like(cb.lower(root.get("student").get("mobile")), like),
                    cb.like(cb.lower(root.get("student").get("college")), like)
            ));
        }

        return internshipApplicationRepository.findAll(spec).stream().map(this::toListItem).toList();
    }

    @Transactional
    public ApplicationDetailResponse updateStatus(String applicationId, StatusUpdateRequest request, String changedBy) {
        InternshipApplication app = internshipApplicationRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        ApplicationStatus oldStatus = app.getStatus();
        app.setStatus(request.getStatus());
        if (request.getRemarks() != null) {
            app.setRemarks(request.getRemarks());
        }
        app = internshipApplicationRepository.save(app);

        historyService.record("INTERNSHIP", applicationId, oldStatus, request.getStatus(), request.getRemarks(), changedBy);

        if (request.getStatus() == ApplicationStatus.SELECTED) {
            mailService.sendSelectionNotification(app.getStudent().getEmail(), app.getStudent().getName(), applicationId, "Internship");
        } else if (request.getStatus() == ApplicationStatus.COMPLETED) {
            mailService.sendCompletionNotification(app.getStudent().getEmail(), app.getStudent().getName(), applicationId, "Internship");
        }

        return toDetail(app);
    }

    private ApplicationDetailResponse toDetail(InternshipApplication app) {
        return ApplicationDetailResponse.builder()
                .applicationId(app.getApplicationId())
                .applicationType("INTERNSHIP")
                .name(app.getStudent().getName())
                .mobile(app.getStudent().getMobile())
                .email(app.getStudent().getEmail())
                .gender(app.getStudent().getGender() != null ? app.getStudent().getGender().name() : null)
                .college(app.getStudent().getCollege())
                .course(app.getStudent().getCourse())
                .year(app.getStudent().getYear())
                .trackOrDomain(app.getDomain().name())
                .duration(app.getDurationMonths())
                .mode(app.getMode().name())
                .referralCode(app.getReferralCode() != null ? app.getReferralCode().getCode() : null)
                .status(app.getStatus())
                .remarks(app.getRemarks())
                .hasResume(app.getResumePath() != null)
                .resumeFileName(app.getResumeFileName())
                .resumeFileSize(app.getResumeFileSize())
                .submittedDate(app.getCreatedAt())
                .statusHistory(historyService.getHistory("INTERNSHIP", app.getApplicationId()))
                .build();
    }

    private ApplicationListItem toListItem(InternshipApplication app) {
        return ApplicationListItem.builder()
                .applicationId(app.getApplicationId())
                .studentName(app.getStudent().getName())
                .email(app.getStudent().getEmail())
                .phone(app.getStudent().getMobile())
                .college(app.getStudent().getCollege())
                .course(app.getStudent().getCourse())
                .trackOrDomain(app.getDomain().name())
                .duration(app.getDurationMonths() + " Months")
                .mode(app.getMode().name())
                .referralCode(app.getReferralCode() != null ? app.getReferralCode().getCode() : null)
                .hasResume(app.getResumePath() != null)
                .resumeFileName(app.getResumeFileName())
                .status(app.getStatus())
                .submittedDate(app.getCreatedAt())
                .build();
    }

    public InternshipApplication getEntityByApplicationId(String applicationId) {
        return internshipApplicationRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));
    }
}
