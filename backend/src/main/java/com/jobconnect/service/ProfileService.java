package com.jobconnect.service;

import com.jobconnect.entity.CandidateProfile;
import com.jobconnect.entity.EmployerProfile;
import com.jobconnect.entity.User;
import com.jobconnect.exception.ResourceNotFoundException;
import com.jobconnect.repository.CandidateProfileRepository;
import com.jobconnect.repository.EmployerProfileRepository;
import com.jobconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final FileStorageService fileStorageService;

    public CandidateProfile getCandidateProfile(Long userId) {
        return candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + userId));
    }

    @Transactional
    public CandidateProfile updateCandidateProfile(Long userId, CandidateProfile updatedProfile) {
        CandidateProfile profile = getCandidateProfile(userId);
        profile.setSkills(updatedProfile.getSkills());
        profile.setExperience(updatedProfile.getExperience());
        profile.setEducation(updatedProfile.getEducation());
        return candidateProfileRepository.save(profile);
    }

    @Transactional
    public String uploadResume(Long userId, MultipartFile file) {
        CandidateProfile profile = getCandidateProfile(userId);
        String fileUrl = fileStorageService.storeFile(file, "resumes");
        profile.setResumeUrl(fileUrl);
        candidateProfileRepository.save(profile);
        return fileUrl;
    }

    public EmployerProfile getEmployerProfile(Long userId) {
        return employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found for user: " + userId));
    }

    @Transactional
    public EmployerProfile updateEmployerProfile(Long userId, EmployerProfile updatedProfile) {
        EmployerProfile profile = getEmployerProfile(userId);
        profile.setCompanyName(updatedProfile.getCompanyName());
        profile.setCompanyDescription(updatedProfile.getCompanyDescription());
        profile.setWebsite(updatedProfile.getWebsite());
        
        // Update user's name as well if they want to sync it
        User user = profile.getUser();
        if (updatedProfile.getUser() != null && updatedProfile.getUser().getName() != null) {
            user.setName(updatedProfile.getUser().getName());
            userRepository.save(user);
        }
        
        return employerProfileRepository.save(profile);
    }

    @Transactional
    public String uploadLogo(Long userId, MultipartFile file) {
        EmployerProfile profile = getEmployerProfile(userId);
        String fileUrl = fileStorageService.storeFile(file, "logos");
        profile.setLogoUrl(fileUrl);
        employerProfileRepository.save(profile);
        return fileUrl;
    }

    @Transactional
    public String uploadProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        String fileUrl = fileStorageService.storeFile(file, "pfps");
        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);
        return fileUrl;
    }
}
