package com.fintech.dashboard.record.api;

import com.fintech.dashboard.common.response.ApiResponse;
import com.fintech.dashboard.record.application.RecordService;
import com.fintech.dashboard.record.application.dto.*;
import com.fintech.dashboard.user.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    // GET /records?type=INCOME&categoryId=1&dateFrom=2024-01-01&...
    @GetMapping
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<RecordResponse>>> listRecords(
            RecordFilterParams params,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(recordService.list(params, principal)));
    }

    // GET /records/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<ApiResponse<RecordResponse>> getRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(recordService.findById(id, principal)));
    }

    // POST /records  — Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RecordResponse>> createRecord(
            @Valid @RequestBody CreateRecordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RecordResponse response = recordService.create(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Record created successfully", response));
    }

    // PUT /records/{id}  — Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RecordResponse>> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Record updated successfully",
                        recordService.update(id, request, principal)));
    }

    // DELETE /records/{id}  — Admin only (soft delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        recordService.softDelete(id, principal);
        return ResponseEntity.noContent().build();
    }
}
