package com.jobconnect.controller;

import com.jobconnect.entity.CandidateProfile;
import com.jobconnect.entity.EmployerProfile;
import com.jobconnect.entity.User;
import com.jobconnect.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // --- Candidate Profile Endpoints ---
    @GetMapping("/seeker/profile")
    public ResponseEntity<CandidateProfile> getCandidateProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getCandidateProfile(user.getId()));
    }

    @PutMapping("/seeker/profile")
    public ResponseEntity<CandidateProfile> updateCandidateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody CandidateProfile updatedProfile
    ) {
        return ResponseEntity.ok(profileService.updateCandidateProfile(user.getId(), updatedProfile));
    }

    @PostMapping("/seeker/profile/resume")
    public ResponseEntity<Map<String, String>> uploadResume(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) {
        String fileUrl = profileService.uploadResume(user.getId(), file);
        return ResponseEntity.ok(Map.of("resumeUrl", fileUrl));
    }

    @GetMapping("/employer/seeker-profile/{userId}")
    public ResponseEntity<CandidateProfile> getCandidateProfileForEmployer(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(profileService.getCandidateProfile(userId));
    }

    // --- Employer Profile Endpoints ---
    @GetMapping("/employer/profile")
    public ResponseEntity<EmployerProfile> getEmployerProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getEmployerProfile(user.getId()));
    }

    @PutMapping("/employer/profile")
    public ResponseEntity<EmployerProfile> updateEmployerProfile(
            @AuthenticationPrincipal User user,
            @RequestBody EmployerProfile updatedProfile
    ) {
        return ResponseEntity.ok(profileService.updateEmployerProfile(user.getId(), updatedProfile));
    }

    @PostMapping("/employer/profile/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) {
        String fileUrl = profileService.uploadLogo(user.getId(), file);
        return ResponseEntity.ok(Map.of("logoUrl", fileUrl));
    }

    // Public Endpoint to view company info
    @GetMapping("/jobs/public/employer-profile/{userId}")
    public ResponseEntity<EmployerProfile> getPublicEmployerProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getEmployerProfile(userId));
    }

    @PostMapping("/profile/pfp")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) {
        String fileUrl = profileService.uploadProfilePicture(user.getId(), file);
        return ResponseEntity.ok(Map.of("profilePictureUrl", fileUrl));
    }
}
