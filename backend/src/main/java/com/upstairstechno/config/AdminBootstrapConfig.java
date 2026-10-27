package com.upstairstechno.config;

import com.upstairstechno.entity.Admin;
import com.upstairstechno.repository.AdminRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Creates the first administrator account on startup, but ONLY if:
 *  - the admins table is empty, AND
 *  - ADMIN_BOOTSTRAP_LOGIN_ID / ADMIN_BOOTSTRAP_PASSWORD env vars are set.
 * This avoids ever hard-coding a production password in source code.
 */
@Configuration
@Slf4j
public class AdminBootstrapConfig {

    @Value("${app.admin.bootstrap.login-id}")
    private String bootstrapLoginId;

    @Value("${app.admin.bootstrap.password}")
    private String bootstrapPassword;

    @Value("${app.admin.bootstrap.name}")
    private String bootstrapName;

    @Value("${app.admin.bootstrap.email}")
    private String bootstrapEmail;

    @Bean
    public CommandLineRunner bootstrapFirstAdmin(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.count() > 0) {
                return;
            }
            if (bootstrapLoginId == null || bootstrapLoginId.isBlank()
                    || bootstrapPassword == null || bootstrapPassword.isBlank()) {
                log.warn("No admin account exists yet. Set ADMIN_BOOTSTRAP_LOGIN_ID and " +
                        "ADMIN_BOOTSTRAP_PASSWORD environment variables and restart to create the first admin.");
                return;
            }

            Admin admin = Admin.builder()
                    .loginId(bootstrapLoginId)
                    .passwordHash(passwordEncoder.encode(bootstrapPassword))
                    .name(bootstrapName)
                    .email(bootstrapEmail)
                    .role("ADMIN")
                    .active(true)
                    .build();

            adminRepository.save(admin);
            log.info("First admin account created for loginId '{}'.", bootstrapLoginId);
        };
    }
}
