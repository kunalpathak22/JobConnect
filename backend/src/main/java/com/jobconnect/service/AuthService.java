package com.jobconnect.service;

import com.jobconnect.config.JwtService;
import com.jobconnect.dto.*;
import com.jobconnect.entity.*;
import com.jobconnect.exception.BadRequestException;
import com.jobconnect.repository.CandidateProfileRepository;
import com.jobconnect.repository.EmployerProfileRepository;
import com.jobconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Set status based on role: employers require admin approval, others are active immediately
        UserStatus status = request.getRole() == Role.EMPLOYER ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(status)
                .emailVerified(false)
                .verificationCode(code)
                .verificationCodeExpiry(LocalDateTime.now().plusMinutes(15))
                .build();

        User savedUser = userRepository.save(user);

        if (request.getRole() == Role.JOB_SEEKER) {
            CandidateProfile candidateProfile = CandidateProfile.builder()
                    .user(savedUser)
                    .skills("")
                    .experience("")
                    .education("")
                    .build();
            candidateProfileRepository.save(candidateProfile);
        } else if (request.getRole() == Role.EMPLOYER) {
            EmployerProfile employerProfile = EmployerProfile.builder()
                    .user(savedUser)
                    .companyName(request.getCompanyName() != null ? request.getCompanyName() : "My Company")
                    .companyDescription(request.getCompanyDescription() != null ? request.getCompanyDescription() : "")
                    .website(request.getWebsite() != null ? request.getWebsite() : "")
                    .build();
            employerProfileRepository.save(employerProfile);
        }

        String subject = "Email Verification - JobConnect";
        String body = "Dear " + savedUser.getName() + ",\n\n"
                + "Thank you for registering on JobConnect. Please use the following 6-digit verification code to verify your email address:\n\n"
                + "CODE: " + code + "\n\n"
                + "This code is valid for 15 minutes.\n\n"
                + "Best regards,\nJobConnect Team";
        emailService.sendEmail(savedUser.getEmail(), subject, body);

        return AuthResponse.builder()
                .token(null) // No token until verified
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .profilePictureUrl(savedUser.getProfilePictureUrl())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Please verify your email address. A verification code was sent to your email.");
        }
        if (user.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Your employer account is pending approval by the administrator.");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BadRequestException("Your account has been deactivated. Please contact support.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadRequestException("Invalid email or password");
        }

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with email: " + request.getEmail()));

        String token = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String subject = "Password Reset Request - JobConnect";
        String body = "Dear " + user.getName() + ",\n\n"
                + "You requested to reset your password. Use the following 6-digit verification code to reset it:\n\n"
                + "CODE: " + token + "\n\n"
                + "This code is valid for 15 minutes. If you did not make this request, please ignore this email.\n\n"
                + "Best regards,\nJobConnect Team";

        emailService.sendEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getCode())) {
            throw new BadRequestException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiry() == null || user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code has expired");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String subject = "Email Verification Code - JobConnect";
        String body = "Dear " + user.getName() + ",\n\n"
                + "Here is your new 6-digit verification code to verify your email address:\n\n"
                + "CODE: " + code + "\n\n"
                + "This code is valid for 15 minutes.\n\n"
                + "Best regards,\nJobConnect Team";
        emailService.sendEmail(user.getEmail(), subject, body);
    }
}
