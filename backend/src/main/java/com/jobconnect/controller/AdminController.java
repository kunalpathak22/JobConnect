package com.jobconnect.controller;

import com.jobconnect.entity.JobStatus;
import com.jobconnect.entity.User;
import com.jobconnect.entity.UserStatus;
import com.jobconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/employers/pending")
    public ResponseEntity<List<User>> getPendingEmployers() {
        return ResponseEntity.ok(adminService.getPendingEmployers());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/employers/{userId}/approve")
    public ResponseEntity<Map<String, String>> approveEmployer(
            @PathVariable Long userId,
            @RequestParam boolean approve
    ) {
        adminService.approveEmployer(userId, approve);
        String message = approve ? "Employer account approved successfully." : "Employer account rejected.";
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, String>> updateUserAccountStatus(
            @PathVariable Long userId,
            @RequestParam UserStatus status
    ) {
        adminService.updateUserAccountStatus(userId, status);
        return ResponseEntity.ok(Map.of("message", "User account status updated to " + status.toString()));
    }

    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<Map<String, String>> moderateJob(
            @PathVariable Long jobId,
            @RequestParam JobStatus status
    ) {
        adminService.moderateJob(jobId, status);
        return ResponseEntity.ok(Map.of("message", "Job listing status updated to " + status.toString()));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User and all associated records deleted successfully."));
    }
}
