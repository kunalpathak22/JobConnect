package com.jobconnect.service;

import com.jobconnect.entity.*;
import com.jobconnect.exception.ResourceNotFoundException;
import com.jobconnect.repository.ApplicationRepository;
import com.jobconnect.repository.JobRepository;
import com.jobconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSeekers", userRepository.countByRole(Role.JOB_SEEKER));
        stats.put("totalEmployers", userRepository.countByRole(Role.EMPLOYER));
        stats.put("pendingEmployers", userRepository.countByStatus(UserStatus.PENDING_APPROVAL));
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs", jobRepository.countByStatus(JobStatus.ACTIVE));
        stats.put("flaggedJobs", jobRepository.countByStatus(JobStatus.FLAGGED));
        stats.put("totalApplications", applicationRepository.count());
        return stats;
    }

    public List<User> getPendingEmployers() {
        return userRepository.findByRole(Role.EMPLOYER).stream()
                .filter(u -> u.getStatus() == UserStatus.PENDING_APPROVAL)
                .toList();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void approveEmployer(Long userId, boolean approve) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getRole() != Role.EMPLOYER) {
            throw new IllegalArgumentException("User is not an employer");
        }

        UserStatus newStatus = approve ? UserStatus.ACTIVE : UserStatus.INACTIVE;
        user.setStatus(newStatus);
        userRepository.save(user);

        // Notify employer via email
        String subject = approve ? "Employer Account Approved - JobConnect" : "Employer Account Application Status - JobConnect";
        String body = approve ? 
                String.format("Dear %s,\n\nCongratulations! Your employer account has been approved by our administrators. You can now log in and start posting job listings.\n\nBest regards,\nJobConnect Admin Team", user.getName()) :
                String.format("Dear %s,\n\nWe regret to inform you that your employer registration was not approved. Please contact support if you believe this is an error.\n\nBest regards,\nJobConnect Admin Team", user.getName());
        
        emailService.sendEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void updateUserAccountStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(status);
        userRepository.save(user);
        
        // Send notification
        String subject = "Account Status Update - JobConnect";
        String body = String.format("Dear %s,\n\nYour JobConnect account status has been updated to: %s.\n\nBest regards,\nJobConnect Admin Team", user.getName(), status.toString());
        emailService.sendEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void moderateJob(Long jobId, JobStatus status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        
        job.setStatus(status);
        jobRepository.save(job);

        // Notify employer
        String message = String.format("Your job listing '%s' has been moderated and is now set to status: %s", 
                job.getTitle(), status.toString());
        notificationService.createNotification(job.getEmployer(), message);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        userRepository.delete(user);
    }
}
