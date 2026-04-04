package com.fintech.dashboard.record.application;

import com.fintech.dashboard.category.infrastructure.CategoryRepository;
import com.fintech.dashboard.common.exception.ResourceNotFoundException;
import com.fintech.dashboard.record.application.dto.*;
import com.fintech.dashboard.record.domain.FinancialRecord;
import com.fintech.dashboard.record.infrastructure.FinancialRecordRepository;
import com.fintech.dashboard.record.infrastructure.RecordSpecification;
import com.fintech.dashboard.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final FinancialRecordRepository recordRepository;
    private final CategoryRepository         categoryRepository;
    private final RecordAccessPolicy         accessPolicy;

    // -------------------------------------------------------------------------
    // READ — Analyst + Admin
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public RecordResponse findById(Long id, UserPrincipal principal) {
        accessPolicy.assertCanRead(principal);

        FinancialRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Financial record not found: " + id));

        String categoryName = resolveCategoryName(record.getCategoryId());
        return RecordResponse.from(record, categoryName);
    }

    @Transactional(readOnly = true)
    public Page<RecordResponse> list(RecordFilterParams params, UserPrincipal principal) {
        accessPolicy.assertCanRead(principal);

        Pageable pageable = buildPageable(params);
        Specification<FinancialRecord> spec = RecordSpecification.fromFilter(params);
        Page<FinancialRecord> page = recordRepository.findAll(spec, pageable);

        // Batch-fetch category names: 1 extra query max regardless of page size
        Set<Long> categoryIds = page.stream()
                .map(FinancialRecord::getCategoryId)
                .collect(Collectors.toSet());
        Map<Long, String> names = categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(
                        c -> c.getId(),
                        c -> c.getName()));

        return page.map(r -> RecordResponse.from(r,
                names.getOrDefault(r.getCategoryId(), "Unknown")));
    }

    // -------------------------------------------------------------------------
    // CREATE — Admin only
    // -------------------------------------------------------------------------

    @Transactional
    public RecordResponse create(CreateRecordRequest request, UserPrincipal principal) {
        accessPolicy.assertCanCreate(principal);

        var category = categoryRepository.findById(request.getCategoryId())
                .filter(c -> c.isActive())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Category not found or inactive: " + request.getCategoryId()));

        FinancialRecord record = FinancialRecord.create(
                principal.getUserId(),
                request.getCategoryId(),
                request.getAmountPaise(),
                request.getCurrency(),
                request.getType(),
                request.getTransactionDate(),
                request.getDescription(),
                request.getNotes(),
                principal.getUserId()   // createdBy = the admin performing the action
        );

        return RecordResponse.from(recordRepository.save(record), category.getName());
    }

    // -------------------------------------------------------------------------
    // UPDATE — Admin only (amount, categoryId, description, notes)
    // -------------------------------------------------------------------------

    @Transactional
    public RecordResponse update(Long id, UpdateRecordRequest request, UserPrincipal principal) {
        accessPolicy.assertCanEdit(principal);

        if (request.getAmountPaise() == null && request.getCategoryId() == null
                && request.getDescription() == null && request.getNotes() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "At least one field must be provided for update");
        }

        FinancialRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Financial record not found: " + id));

        // Validate the new category if being changed
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .filter(c -> c.isActive())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Category not found or inactive: " + request.getCategoryId()));
        }

        record.update(
                request.getAmountPaise(),
                request.getCategoryId(),
                request.getDescription(),
                request.getNotes(),
                principal.getUserId()
        );

        FinancialRecord saved = recordRepository.save(record);
        return RecordResponse.from(saved, resolveCategoryName(saved.getCategoryId()));
    }

    // -------------------------------------------------------------------------
    // SOFT DELETE — Admin only
    // -------------------------------------------------------------------------

    @Transactional
    public void softDelete(Long id, UserPrincipal principal) {
        accessPolicy.assertCanDelete(principal);

        FinancialRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Financial record not found: " + id));

        record.softDelete(principal.getUserId());
        recordRepository.save(record);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String resolveCategoryName(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .map(c -> c.getName())
                .orElse("Unknown");
    }

    private Pageable buildPageable(RecordFilterParams params) {
        int size = Math.min(Math.max(params.getSize(), 1), 100);
        int page = Math.max(params.getPage(), 0);
        return PageRequest.of(page, size, parseSort(params.getSort()));
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "transactionDate");
        }
        String[] parts = sortParam.split(",", 2);
        String field = parts[0].trim();
        Sort.Direction dir = (parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }
}
