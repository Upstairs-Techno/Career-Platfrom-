package com.upstairstechno.controller;

import com.upstairstechno.dto.ApplicationDetailResponse;
import com.upstairstechno.dto.ApplicationResponse;
import com.upstairstechno.dto.OjtApplicationRequest;
import com.upstairstechno.entity.OjtTrack;
import com.upstairstechno.entity.TrainingMode;
import com.upstairstechno.service.OjtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ojt")
@RequiredArgsConstructor
public class OjtController {

    private final OjtService ojtService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> programInfo() {
        return ResponseEntity.ok(Map.of(
                "durations", List.of(4, 6, 8, 12),
                "trainingHours", "60-120 Hours",
                "modes", TrainingMode.values(),
                "tracks", OjtTrack.values()
        ));
    }

    @GetMapping("/tracks")
    public ResponseEntity<OjtTrack[]> tracks() {
        return ResponseEntity.ok(OjtTrack.values());
    }

    @PostMapping(value = "/applications", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApplicationResponse> applyJson(@Valid @RequestBody OjtApplicationRequest request) {
        ApplicationResponse response = ojtService.apply(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/applications", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponse> applyMultipart(
            @Valid @ModelAttribute OjtApplicationRequest request,
            @RequestParam(value = "resume", required = false) org.springframework.web.multipart.MultipartFile resume) {
        ApplicationResponse response = ojtService.apply(request, resume);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApplicationDetailResponse> getApplication(@PathVariable("id") String applicationId) {
        return ResponseEntity.ok(ojtService.getByApplicationId(applicationId));
    }
}
