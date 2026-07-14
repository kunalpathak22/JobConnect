package com.jobconnect.controller;

import com.jobconnect.entity.Job;
import com.jobconnect.entity.JobType;
import com.jobconnect.entity.User;
import com.jobconnect.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // --- Public Job Endpoints ---
    @GetMapping("/jobs/public/search")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<Job> jobs = jobService.searchJobs(keyword, location, category, jobType, minSalary, maxSalary, false, page, size, sortBy, sortDir);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/public/stats")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        return ResponseEntity.ok(jobService.getPublicStats());
    }

    @GetMapping("/jobs/public/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // --- Employer Job Endpoints ---
    @PostMapping("/employer/jobs")
    public ResponseEntity<Job> createJob(
            @AuthenticationPrincipal User user,
            @RequestBody Job job
    ) {
        return ResponseEntity.ok(jobService.createJob(user.getId(), job));
    }

    @PutMapping("/employer/jobs/{id}")
    public ResponseEntity<Job> updateJob(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Job job
    ) {
        return ResponseEntity.ok(jobService.updateJob(user.getId(), id, job));
    }

    @DeleteMapping("/employer/jobs/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        jobService.deleteJob(user.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Job listing deleted successfully"));
    }

    @GetMapping("/employer/jobs")
    public ResponseEntity<Page<Job>> getEmployerJobs(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(user.getId(), page, size, sortBy, sortDir));
    }

    // --- Candidate Saved Jobs Endpoints ---
    @PostMapping("/seeker/jobs/saved")
    public ResponseEntity<Map<String, String>> saveJob(
            @AuthenticationPrincipal User user,
            @RequestParam Long jobId
    ) {
        jobService.saveJob(user.getId(), jobId);
        return ResponseEntity.ok(Map.of("message", "Job saved successfully"));
    }

    @DeleteMapping("/seeker/jobs/saved/{jobId}")
    public ResponseEntity<Map<String, String>> unsaveJob(
            @AuthenticationPrincipal User user,
            @PathVariable Long jobId
    ) {
        jobService.unsaveJob(user.getId(), jobId);
        return ResponseEntity.ok(Map.of("message", "Job removed from saved list"));
    }

    @GetMapping("/seeker/jobs/saved")
    public ResponseEntity<Page<Job>> getSavedJobs(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(jobService.getSavedJobs(user.getId(), page, size));
    }

    @GetMapping("/seeker/jobs/saved/{jobId}/check")
    public ResponseEntity<Map<String, Boolean>> checkBookmarked(
            @AuthenticationPrincipal User user,
            @PathVariable Long jobId
    ) {
        boolean isBookmarked = jobService.isJobBookmarked(user.getId(), jobId);
        return ResponseEntity.ok(Map.of("bookmarked", isBookmarked));
    }
}
