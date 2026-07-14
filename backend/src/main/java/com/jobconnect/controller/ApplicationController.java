package com.jobconnect.controller;

import com.jobconnect.entity.Application;
import com.jobconnect.entity.ApplicationStatus;
import com.jobconnect.entity.User;
import com.jobconnect.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // --- Candidate Application Endpoints ---
    @PostMapping(value = "/seeker/applications", consumes = "multipart/form-data")
    public ResponseEntity<Application> applyToJob(
            @AuthenticationPrincipal User user,
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(applicationService.applyToJob(user.getId(), jobId, file));
    }

    @GetMapping("/seeker/applications")
    public ResponseEntity<Page<Application>> getSeekerApplications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(applicationService.getApplicationsByCandidate(user.getId(), page, size));
    }

    // --- Employer Application Endpoints ---
    @GetMapping("/employer/jobs/{jobId}/applications")
    public ResponseEntity<Page<Application>> getJobApplicants(
            @AuthenticationPrincipal User user,
            @PathVariable Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(user.getId(), jobId, status, page, size));
    }

    @PutMapping("/employer/applications/{applicationId}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId,
            @RequestParam("status") ApplicationStatus status,
            @RequestParam(value = "feedback", required = false) String feedback
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(user.getId(), applicationId, status, feedback));
    }
}
