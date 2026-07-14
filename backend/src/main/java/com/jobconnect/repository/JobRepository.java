package com.jobconnect.repository;

import com.jobconnect.entity.Job;
import com.jobconnect.entity.JobStatus;
import com.jobconnect.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE " +
           "(:showAll = true OR j.status = 'ACTIVE') " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:category IS NULL OR LOWER(j.category) = LOWER(:category)) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "AND (:minSalary IS NULL OR j.salary >= :minSalary) " +
           "AND (:maxSalary IS NULL OR j.salary <= :maxSalary)")
    Page<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("category") String category,
            @Param("jobType") JobType jobType,
            @Param("minSalary") Double minSalary,
            @Param("maxSalary") Double maxSalary,
            @Param("showAll") boolean showAll,
            Pageable pageable
    );

    long countByStatus(JobStatus status);
    long countByStatusAndCategoryIgnoreCase(JobStatus status, String category);
}
