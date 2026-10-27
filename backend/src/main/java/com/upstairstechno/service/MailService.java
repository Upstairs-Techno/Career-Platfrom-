package com.upstairstechno.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Thin wrapper around JavaMailSender. Controlled by app.mail.enabled so the
 * application still boots and runs cleanly in environments where SMTP
 * credentials (MAIL_HOST / MAIL_USERNAME / MAIL_PASSWORD) have not been
 * configured yet - emails are simply logged instead of sent.
 */
@Service
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from}")
    private String fromAddress;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendApplicationReceived(String toEmail, String studentName, String applicationId, String programName) {
        String subject = "UPSTAIRS TECHNO — Application Received";
        String body = "Dear " + studentName + ",\n\n"
                + "Thank you for applying for the UPSTAIRS TECHNO " + programName + " program.\n"
                + "Application ID: " + applicationId + "\n\n"
                + "Our team will review your application and contact you regarding the next steps.\n\n"
                + "Regards,\nUPSTAIRS TECHNO";
        send(toEmail, subject, body);
    }

    public void sendSelectionNotification(String toEmail, String studentName, String applicationId, String programName) {
        String subject = "UPSTAIRS TECHNO — You've Been Selected";
        String body = "Dear " + studentName + ",\n\n"
                + "Congratulations! You have been selected for the UPSTAIRS TECHNO " + programName + " program.\n"
                + "Application ID: " + applicationId + "\n\n"
                + "Our team will reach out with joining details shortly.\n\n"
                + "Regards,\nUPSTAIRS TECHNO";
        send(toEmail, subject, body);
    }

    public void sendCompletionNotification(String toEmail, String studentName, String applicationId, String programName) {
        String subject = "UPSTAIRS TECHNO — Program Completed";
        String body = "Dear " + studentName + ",\n\n"
                + "Congratulations on completing the UPSTAIRS TECHNO " + programName + " program.\n"
                + "Application ID: " + applicationId + "\n\n"
                + "Completion documentation, where applicable, will be shared separately.\n\n"
                + "Regards,\nUPSTAIRS TECHNO";
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Would send to {} | Subject: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
