package com.upstairstechno.service;

import com.upstairstechno.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class ResumeStorageServiceTest {

    private ResumeStorageService storageService;

    @BeforeEach
    void setUp(@TempDir Path tempDir) {
        storageService = new ResumeStorageService(tempDir.toString());
    }

    @Test
    void storeResume_returnsNullWhenFileNullOrEmpty() {
        assertNull(storageService.storeResume("OJT-2026-0001", null));

        MockMultipartFile emptyFile = new MockMultipartFile("resume", "resume.pdf", "application/pdf", new byte[0]);
        assertNull(storageService.storeResume("OJT-2026-0001", emptyFile));
    }

    @Test
    void storeResume_acceptsPdfFile() {
        MockMultipartFile file = new MockMultipartFile(
                "resume", "my_resume.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        ResumeStorageService.StoredResume stored = storageService.storeResume("OJT-2026-0001", file);
        assertNotNull(stored);
        assertEquals("my_resume.pdf", stored.getOriginalFileName());
        assertEquals("application/pdf", stored.getContentType());
        assertTrue(stored.getFileSize() > 0);

        Resource resource = storageService.loadAsResource(stored.getStoredPath());
        assertNotNull(resource);
        assertTrue(resource.exists());
    }

    @Test
    void storeResume_acceptsDocAndDocx() {
        MockMultipartFile docFile = new MockMultipartFile(
                "resume", "resume.doc", "application/msword", "doc content".getBytes()
        );
        ResumeStorageService.StoredResume storedDoc = storageService.storeResume("INT-2026-0001", docFile);
        assertNotNull(storedDoc);
        assertEquals("resume.doc", storedDoc.getOriginalFileName());

        MockMultipartFile docxFile = new MockMultipartFile(
                "resume", "resume.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "docx content".getBytes()
        );
        ResumeStorageService.StoredResume storedDocx = storageService.storeResume("INT-2026-0002", docxFile);
        assertNotNull(storedDocx);
        assertEquals("resume.docx", storedDocx.getOriginalFileName());
    }

    @Test
    void storeResume_rejectsInvalidExtension() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "resume", "malware.exe", "application/octet-stream", "bad".getBytes()
        );
        assertThrows(BadRequestException.class, () -> storageService.storeResume("OJT-2026-0002", exeFile));

        MockMultipartFile pngFile = new MockMultipartFile(
                "resume", "image.png", "image/png", "img".getBytes()
        );
        assertThrows(BadRequestException.class, () -> storageService.storeResume("OJT-2026-0003", pngFile));
    }

    @Test
    void storeResume_rejectsOversizedFile() {
        byte[] oversized = new byte[(int) (ResumeStorageService.MAX_RESUME_SIZE_BYTES + 1024)];
        MockMultipartFile largeFile = new MockMultipartFile(
                "resume", "huge.pdf", "application/pdf", oversized
        );
        assertThrows(BadRequestException.class, () -> storageService.storeResume("OJT-2026-0004", largeFile));
    }

    @Test
    void storeResume_rejectsPathTraversal() {
        MockMultipartFile traversalFile = new MockMultipartFile(
                "resume", "../secret.pdf", "application/pdf", "test".getBytes()
        );
        assertThrows(BadRequestException.class, () -> storageService.storeResume("OJT-2026-0005", traversalFile));
    }
}
