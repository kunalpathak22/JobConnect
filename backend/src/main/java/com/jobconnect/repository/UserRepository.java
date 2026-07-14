package com.jobconnect.repository;

import com.jobconnect.entity.Role;
import com.jobconnect.entity.User;
import com.jobconnect.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    long countByStatus(UserStatus status);
    Optional<User> findByResetToken(String resetToken);
}
