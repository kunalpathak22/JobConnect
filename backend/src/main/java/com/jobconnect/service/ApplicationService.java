package com.jobconnect.service;

import com.jobconnect.entity.*;
import com.jobconnect.exception.BadRequestException;
import com.jobconnect.exception.ResourceNotFoundException;
import com.jobconnect.repository.ApplicationRepository;
import com.jobconnect.repository.CandidateProfileRepository;
import com.jobconnect.repository.JobRepository;
import com.jobconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public Application applyToJob(Long candidateId, Long jobId, MultipartFile customResume) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("This job listing is no longer active");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            throw new BadRequestException("You have already applied for this job");
        }

        String resumeUrl = null;
        if (customResume != null && !customResume.isEmpty()) {
            resumeUrl = fileStorageService.storeFile(customResume, "resumes");
        } else {
            CandidateProfile profile = candidateProfileRepository.findByUserId(candidateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));
            if (profile.getResumeUrl() == null || profile.getResumeUrl().isEmpty()) {
                throw new BadRequestException("Please upload a resume first or upload a custom resume with your application");
            }
            resumeUrl = profile.getResumeUrl();
        }

        Application application = Application.builder()
                .candidate(candidate)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .resumeUrl(resumeUrl)
                .build();

        Application savedApplication = applicationRepository.save(application);

        // Notify Employer
        String notificationMessage = String.format("New application received from %s for your job post: %s", 
                candidate.getName(), job.getTitle());
        notificationService.createNotification(job.getEmployer(), notificationMessage);

        return savedApplication;
    }

    public Page<Application> getApplicationsByCandidate(Long candidateId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedDate").descending());
        return applicationRepository.findByCandidateId(candidateId, pageable);
    }

    public Page<Application> getApplicationsByJob(Long employerId, Long jobId, ApplicationStatus status, int page, int size) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new BadRequestException("You are not authorized to view applicants for this job");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedDate").descending());
        if (status != null) {
            return applicationRepository.findByJobIdAndStatus(jobId, status, pageable);
        }
        return applicationRepository.findByJobId(jobId, pageable);
    }

    @Transactional
    public Application updateApplicationStatus(Long employerId, Long applicationId, ApplicationStatus status, String feedback) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getJob().getEmployer().getId().equals(employerId)) {
            throw new BadRequestException("You are not authorized to update this application status");
        }

        application.setStatus(status);
        if (feedback != null) {
            application.setFeedback(feedback);
        }

        Application updatedApplication = applicationRepository.save(application);

        // Notify Candidate (In-App)
        String message = String.format("Your application for the role '%s' at '%s' has been %s.",
                application.getJob().getTitle(),
                application.getJob().getEmployer().getName(),
                status.toString());
        notificationService.createNotification(application.getCandidate(), message);

        // Notify Candidate (Email)
        String subject = "Job Application Update - " + application.getJob().getTitle();
        String body = String.format("Dear %s,\n\n"
                + "We would like to inform you that the status of your job application for the position of '%s' at '%s' has been updated.\n\n"
                + "New Status: %s\n"
                + "Recruiter Feedback: %s\n\n"
                + "Please log in to JobConnect to view details.\n\n"
                + "Best regards,\nJobConnect Team",
                application.getCandidate().getName(),
                application.getJob().getTitle(),
                application.getJob().getEmployer().getName(),
                status.toString(),
                feedback != null ? feedback : "No comments provided.");

        emailService.sendEmail(application.getCandidate().getEmail(), subject, body);

        return updatedApplication;
    }
}
