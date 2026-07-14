package com.jobconnect.config;

import com.jobconnect.entity.*;
import com.jobconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            // Already seeded
            return;
        }

        System.out.println("Seeding database with default user records...");

        // 1. Create Admin
        User admin = User.builder()
                .name("Platform Admin")
                .email("admin@jobconnect.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(admin);

        // 2. Create Employers (3)
        User emp1 = User.builder()
                .name("Alice Smith")
                .email("alice@techcorp.com")
                .password(passwordEncoder.encode("emp123"))
                .role(Role.EMPLOYER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(emp1);
        EmployerProfile empProfile1 = EmployerProfile.builder()
                .user(emp1)
                .companyName("TechCorp Solutions")
                .companyDescription("Leading software solutions and consulting firm specializing in AI and cloud infrastructure.")
                .website("https://techcorp.com")
                .logoUrl(null)
                .build();
        employerProfileRepository.save(empProfile1);

        User emp2 = User.builder()
                .name("Bob Johnson")
                .email("bob@marketinglabs.com")
                .password(passwordEncoder.encode("emp123"))
                .role(Role.EMPLOYER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(emp2);
        EmployerProfile empProfile2 = EmployerProfile.builder()
                .user(emp2)
                .companyName("Marketing Labs")
                .companyDescription("Full-service digital marketing agency boosting startup visibility.")
                .website("https://marketinglabs.com")
                .logoUrl(null)
                .build();
        employerProfileRepository.save(empProfile2);

        User emp3 = User.builder()
                .name("Charlie Davis")
                .email("charlie@finsec.com")
                .password(passwordEncoder.encode("emp123"))
                .role(Role.EMPLOYER)
                .status(UserStatus.PENDING_APPROVAL) // Test pending approval admin feature
                .emailVerified(true)
                .build();
        userRepository.save(emp3);
        EmployerProfile empProfile3 = EmployerProfile.builder()
                .user(emp3)
                .companyName("FinSec Capital")
                .companyDescription("Investment bank and retail financial services group.")
                .website("https://finsec.com")
                .logoUrl(null)
                .build();
        employerProfileRepository.save(empProfile3);

        // 3. Create Candidates (5)
        User seeker1 = User.builder()
                .name("John Doe")
                .email("john@gmail.com")
                .password(passwordEncoder.encode("seeker123"))
                .role(Role.JOB_SEEKER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(seeker1);
        CandidateProfile candProfile1 = CandidateProfile.builder()
                .user(seeker1)
                .skills("Java, Spring Boot, MySQL, REST APIs, Git")
                .experience("3 years as a Backend Software Engineer building enterprise systems.")
                .education("B.Tech in Computer Science - State University")
                .resumeUrl(null)
                .build();
        candidateProfileRepository.save(candProfile1);

        User seeker2 = User.builder()
                .name("Emma Watson")
                .email("emma@gmail.com")
                .password(passwordEncoder.encode("seeker123"))
                .role(Role.JOB_SEEKER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(seeker2);
        CandidateProfile candProfile2 = CandidateProfile.builder()
                .user(seeker2)
                .skills("React, TypeScript, JavaScript, HTML, CSS, Tailwind")
                .experience("2 years as a Frontend Engineer crafting responsive UI dashboards.")
                .education("B.Sc in Information Technology - Technical Institute")
                .resumeUrl(null)
                .build();
        candidateProfileRepository.save(candProfile2);

        User seeker3 = User.builder()
                .name("David Miller")
                .email("david@gmail.com")
                .password(passwordEncoder.encode("seeker123"))
                .role(Role.JOB_SEEKER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(seeker3);
        CandidateProfile candProfile3 = CandidateProfile.builder()
                .user(seeker3)
                .skills("Python, Machine Learning, SQL, Pandas, NumPy")
                .experience("1 year Junior Data Analyst.")
                .education("M.Sc in Data Science - University of Science")
                .resumeUrl(null)
                .build();
        candidateProfileRepository.save(candProfile3);

        User seeker4 = User.builder()
                .name("Sophia Brown")
                .email("sophia@gmail.com")
                .password(passwordEncoder.encode("seeker123"))
                .role(Role.JOB_SEEKER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(seeker4);
        CandidateProfile candProfile4 = CandidateProfile.builder()
                .user(seeker4)
                .skills("SEO, Copywriting, Google Ads, Social Media Marketing")
                .experience("4 years as Marketing Specialist.")
                .education("Bachelor in Business Administration (BBA) - Commerce College")
                .resumeUrl(null)
                .build();
        candidateProfileRepository.save(candProfile4);

        User seeker5 = User.builder()
                .name("James Wilson")
                .email("james@gmail.com")
                .password(passwordEncoder.encode("seeker123"))
                .role(Role.JOB_SEEKER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(seeker5);
        CandidateProfile candProfile5 = CandidateProfile.builder()
                .user(seeker5)
                .skills("Java, Node.js, React, Docker, Kubernetes, AWS")
                .experience("5 years of Full Stack development experience.")
                .education("B.E. in Software Engineering - National College")
                .resumeUrl(null)
                .build();
        candidateProfileRepository.save(candProfile5);

        // 4. Create Job Listings (5)
        Job job1 = Job.builder()
                .employer(emp1)
                .title("Senior Java Developer")
                .description("We are looking for an experienced Java Developer to maintain and build high-performance microservices backend. Skills in Spring Boot and JPA are required.")
                .category("Software Engineering")
                .location("New York, NY (Hybrid)")
                .salary(120000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.ACTIVE)
                .requiredSkills("Java, Spring Boot, PostgreSQL, Microservices")
                .postedDate(LocalDateTime.now().minusDays(5))
                .build();
        jobRepository.save(job1);

        Job job2 = Job.builder()
                .employer(emp1)
                .title("Frontend Developer (React)")
                .description("Join our dynamic product team and build interfaces using React.js and TypeScript. You should have 2+ years of experience with state management (Redux/Context API).")
                .category("Software Engineering")
                .location("San Francisco, CA (Remote)")
                .salary(105000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.ACTIVE)
                .requiredSkills("React, TypeScript, CSS, Tailwind")
                .postedDate(LocalDateTime.now().minusDays(3))
                .build();
        jobRepository.save(job2);

        Job job3 = Job.builder()
                .employer(emp2)
                .title("Digital Marketing Specialist")
                .description("Lead our social media campaigns, SEO strategy, and client content writing. Experience with AdWords and web analytics is a major plus.")
                .category("Marketing")
                .location("Austin, TX (On-site)")
                .salary(75000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.ACTIVE)
                .requiredSkills("SEO, Copywriting, Google Ads, Content Strategy")
                .postedDate(LocalDateTime.now().minusDays(2))
                .build();
        jobRepository.save(job3);

        Job job4 = Job.builder()
                .employer(emp1)
                .title("Backend Engineering Intern")
                .description("Great opportunity for university students to work alongside senior developers on core Node.js and Java microservices.")
                .category("Software Engineering")
                .location("New York, NY (Hybrid)")
                .salary(45000.0)
                .jobType(JobType.INTERNSHIP)
                .status(JobStatus.ACTIVE)
                .requiredSkills("Java or Node.js, SQL, Basic Git")
                .postedDate(LocalDateTime.now().minusDays(1))
                .build();
        jobRepository.save(job4);

        Job job5 = Job.builder()
                .employer(emp2)
                .title("SEO Content Writer")
                .description("Create blogs, articles, and product copy optimized for search engines. This is a contract-based position.")
                .category("Marketing")
                .location("Chicago, IL (Remote)")
                .salary(50000.0)
                .jobType(JobType.CONTRACT)
                .status(JobStatus.ACTIVE)
                .requiredSkills("Copywriting, SEO, Research")
                .postedDate(LocalDateTime.now().minusDays(10))
                .build();
        jobRepository.save(job5);

        // 5. Create Applications (3)
        Application app1 = Application.builder()
                .job(job1)
                .candidate(seeker1)
                .status(ApplicationStatus.APPLIED)
                .resumeUrl("/uploads/resumes/seed-resume-john.pdf")
                .appliedDate(LocalDateTime.now().minusDays(2))
                .build();
        applicationRepository.save(app1);

        Application app2 = Application.builder()
                .job(job2)
                .candidate(seeker2)
                .status(ApplicationStatus.SHORTLISTED)
                .resumeUrl("/uploads/resumes/seed-resume-emma.pdf")
                .appliedDate(LocalDateTime.now().minusDays(1))
                .feedback("Strong frontend portfolio. Schedule preliminary interview.")
                .build();
        applicationRepository.save(app2);

        Application app3 = Application.builder()
                .job(job3)
                .candidate(seeker4)
                .status(ApplicationStatus.REJECTED)
                .resumeUrl("/uploads/resumes/seed-resume-sophia.pdf")
                .appliedDate(LocalDateTime.now().minusDays(1))
                .feedback("Candidate lacks AdWords certification as requested for this specific post.")
                .build();
        applicationRepository.save(app3);

        System.out.println("Default user records successfully seeded!");
    }
}
