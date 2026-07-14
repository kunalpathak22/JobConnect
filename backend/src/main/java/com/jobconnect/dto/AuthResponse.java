package com.jobconnect.dto;

import com.jobconnect.entity.Role;
import com.jobconnect.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private String profilePictureUrl;
}
