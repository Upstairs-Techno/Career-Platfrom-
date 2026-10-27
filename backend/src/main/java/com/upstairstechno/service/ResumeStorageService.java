package com.upstairstechno.service;

import com.upstairstechno.exception.BadRequestException;
import com.upstairstechno.exception.ResourceNotFoundException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;

@Service
@Slf4j
public class ResumeStorageService {

    public static final long MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".doc", ".docx");

    private final Path uploadLocation;

    public ResumeStorageService(@Value("${app.upload.resume-dir:./uploads/resumes}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException e) {
            log.error("Could not create resume upload directory at {}", this.uploadLocation, e);
        }
    }

    @Getter
    public static class StoredResume {
        private final String storedPath;
        private final String originalFileName;
        private final String contentType;
        private final long fileSize;

        public StoredResume(String storedPath, String originalFileName, String contentType, long fileSize) {
            this.storedPath = storedPath;
            this.originalFileName = originalFileName;
            this.contentType = contentType;
            this.fileSize = fileSize;
        }
    }

    /**
     * Validates and stores the uploaded resume file.
     * Returns null if file is null or empty (since resume is optional).
     */
    public StoredResume storeResume(String applicationId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 1. Validate file size
        if (file.getSize() > MAX_RESUME_SIZE_BYTES) {
            throw new BadRequestException("Resume file size exceeds the 5 MB limit. Please upload a smaller file.");
        }

        // 2. Validate file name and extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BadRequestException("Invalid resume file: file name is missing.");
        }

        String cleanedName = StringUtils.cleanPath(originalFilename);
        if (cleanedName.contains("..")) {
            throw new BadRequestException("Invalid resume file name: path traversal characters detected.");
        }

        int lastDotIndex = cleanedName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            throw new BadRequestException("Invalid file format. Only PDF, DOC, and DOCX files are allowed.");
        }

        String extension = cleanedName.substring(lastDotIndex).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file format (" + extension + "). Only PDF, DOC, and DOCX files are allowed.");
        }

        // 3. Resolve Content Type
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank() || "application/octet-stream".equals(contentType)) {
            contentType = switch (extension) {
                case ".pdf" -> "application/pdf";
                case ".doc" -> "application/msword";
                case ".docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                default -> "application/octet-stream";
            };
        }

        try {
            // 4. Create subfolder per application or prefix to avoid collisions
            Path targetDir = this.uploadLocation.resolve(applicationId).normalize();
            if (!targetDir.startsWith(this.uploadLocation)) {
                throw new BadRequestException("Invalid storage destination.");
            }
            Files.createDirectories(targetDir);

            // Clean file name to safe alphanumeric
            String safeBaseName = cleanedName.substring(0, lastDotIndex).replaceAll("[^a-zA-Z0-9_-]", "_");
            String storedFileName = safeBaseName + "_" + System.currentTimeMillis() + extension;
            Path destinationPath = targetDir.resolve(storedFileName).normalize();

            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored resume for application {} at {}", applicationId, destinationPath);

            return new StoredResume(
                    destinationPath.toString(),
                    cleanedName,
                    contentType,
                    file.getSize()
            );
        } catch (IOException e) {
            log.error("Failed to store resume for application {}", applicationId, e);
            throw new BadRequestException("Failed to store resume file. Please try again.");
        }
    }

    /**
     * Loads a stored resume as a Spring Resource, verifying security boundaries.
     */
    public Resource loadAsResource(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            throw new ResourceNotFoundException("Resume file not found.");
        }

        try {
            Path file = Paths.get(storedPath).normalize();
            if (!file.startsWith(this.uploadLocation)) {
                log.warn("Access denied for file outside upload directory: {}", storedPath);
                throw new ResourceNotFoundException("Resume file not found.");
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Resume file not found or cannot be read.");
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Resume file not found.");
        }
    }
}
