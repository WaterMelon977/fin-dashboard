package com.fintech.dashboard.record.application;

import com.fintech.dashboard.user.domain.Role;
import com.fintech.dashboard.user.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

/**
 * Pure policy component — no DB calls.
 * Contains all authorization rules for FinancialRecord operations.
 *
 * Controller-level @PreAuthorize is the *first* gate.
 * These assert* methods are the *second* gate, called inside RecordService,
 * so the policy cannot be bypassed by calling the service directly.
 */
@Component
public class RecordAccessPolicy {

    public boolean canRead(UserPrincipal principal) {
        Role role = principal.getUser().getRole();
        return role == Role.ANALYST || role == Role.ADMIN;
    }

    public boolean canCreate(UserPrincipal principal) {
        return principal.getUser().getRole() == Role.ADMIN;
    }

    public boolean canEdit(UserPrincipal principal) {
        return principal.getUser().getRole() == Role.ADMIN;
    }

    public boolean canDelete(UserPrincipal principal) {
        return principal.getUser().getRole() == Role.ADMIN;
    }

    public void assertCanRead(UserPrincipal principal) {
        if (!canRead(principal)) deny("view financial records");
    }

    public void assertCanCreate(UserPrincipal principal) {
        if (!canCreate(principal)) deny("create financial records");
    }

    public void assertCanEdit(UserPrincipal principal) {
        if (!canEdit(principal)) deny("edit financial records");
    }

    public void assertCanDelete(UserPrincipal principal) {
        if (!canDelete(principal)) deny("delete financial records");
    }

    private void deny(String action) {
        throw new AccessDeniedException(
                "You do not have permission to " + action);
    }
}
