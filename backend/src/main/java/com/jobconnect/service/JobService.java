package com.jobconnect.service;

import com.jobconnect.entity.*;
import com.jobconnect.exception.BadRequestException;
import com.jobconnect.exception.ResourceNotFoundException;
import com.jobconnect.repository.JobRepository;
import com.jobconnect.repository.SavedJobRepository;
import com.jobconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;

    @Transactional
    public Job createJob(Long employerId, Job job) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer user not found: " + employerId));
        
        if (employer.getRole() != Role.EMPLOYER) {
            throw new BadRequestException("Only employers can post jobs");
        }

        job.setEmployer(employer);
        job.setStatus(JobStatus.ACTIVE);
        return jobRepository.save(job);
    }

    @Transactional
    public Job updateJob(Long employerId, Long jobId, Job updatedJob) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new BadRequestException("You are not authorized to update this job listing");
        }

        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setCategory(updatedJob.getCategory());
        job.setLocation(updatedJob.getLocation());
        job.setSalary(updatedJob.getSalary());
        job.setJobType(updatedJob.getJobType());
        job.setRequiredSkills(updatedJob.getRequiredSkills());
        if (updatedJob.getStatus() != null) {
            job.setStatus(updatedJob.getStatus());
        }

        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new BadRequestException("You are not authorized to delete this job listing");
        }

        jobRepository.delete(job);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));
    }

    public Page<Job> getJobsByEmployer(Long employerId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return jobRepository.findByEmployerId(employerId, pageable);
    }

    public Page<Job> searchJobs(String keyword, String location, String category, JobType jobType, 
                               Double minSalary, Double maxSalary, boolean showAll, int page, int size, 
                               String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return jobRepository.searchJobs(keyword, location, category, jobType, minSalary, maxSalary, showAll, pageable);
    }

    @Transactional
    public void saveJob(Long userId, Long jobId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new BadRequestException("Job is already bookmarked");
        }

        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .build();
        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        SavedJob savedJob = savedJobRepository.findByUserIdAndJobId(userId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));
        savedJobRepository.delete(savedJob);
    }

    public Page<Job> getSavedJobs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("savedAt").descending());
        Page<SavedJob> savedJobsPage = savedJobRepository.findByUserId(userId, pageable);
        
        List<Job> jobs = savedJobsPage.getContent().stream()
                .map(SavedJob::getJob)
                .collect(Collectors.toList());

        return new PageImpl<>(jobs, pageable, savedJobsPage.getTotalElements());
    }

    public boolean isJobBookmarked(Long userId, Long jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    public Map<String, Object> getPublicStats() {
        long activeJobsCount = jobRepository.countByStatus(JobStatus.ACTIVE);
        long candidatesCount = userRepository.countByRole(Role.JOB_SEEKER);
        long employersCount = userRepository.countByRole(Role.EMPLOYER);

        long softwareJobs = jobRepository.countByStatusAndCategoryIgnoreCase(JobStatus.ACTIVE, "Software Engineering");
        long marketingJobs = jobRepository.countByStatusAndCategoryIgnoreCase(JobStatus.ACTIVE, "Marketing");
        long designJobs = jobRepository.countByStatusAndCategoryIgnoreCase(JobStatus.ACTIVE, "Design");
        long financeJobs = jobRepository.countByStatusAndCategoryIgnoreCase(JobStatus.ACTIVE, "Finance");

        return Map.of(
            "activeJobs", activeJobsCount,
            "candidates", candidatesCount,
            "employers", employersCount,
            "softwareJobs", softwareJobs,
            "marketingJobs", marketingJobs,
            "designJobs", designJobs,
            "financeJobs", financeJobs
        );
    }
}
