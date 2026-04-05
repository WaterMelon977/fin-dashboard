package com.fintech.dashboard.record.infrastructure;

import com.fintech.dashboard.record.application.dto.RecordFilterParams;
import com.fintech.dashboard.record.domain.FinancialRecord;
import com.fintech.dashboard.record.domain.RecordType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * Static factory for building JPA {@link Specification} predicates against
 * {@link FinancialRecord}.  All methods are composable — combine with
 * {@link Specification#and}.
 *
 * <p>{@code fromFilter(params)} is the primary entry-point: it ANDs every
 * non-null filter field, so callers never need to touch the individual
 * predicates directly.
 */
public final class RecordSpecification {

    private RecordSpecification() {}

    public static Specification<FinancialRecord> hasType(RecordType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<FinancialRecord> hasCategory(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("categoryId"), categoryId);
    }

    public static Specification<FinancialRecord> onOrAfter(LocalDate from) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("transactionDate"), from);
    }

    public static Specification<FinancialRecord> onOrBefore(LocalDate to) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("transactionDate"), to);
    }

    public static Specification<FinancialRecord> amountAtLeast(Long paise) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("amountPaise"), paise);
    }

    public static Specification<FinancialRecord> amountAtMost(Long paise) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("amountPaise"), paise);
    }

    public static Specification<FinancialRecord> descriptionContains(String search) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("description")),
                        "%" + search.toLowerCase() + "%");
    }

    /**
     * Builds a compound Specification from a filter DTO.
     * Only non-null / non-blank params produce a predicate.
     */
    public static Specification<FinancialRecord> fromFilter(RecordFilterParams params) {
        Specification<FinancialRecord> spec = (root, query, cb) -> cb.conjunction();

        if (params.getType()       != null) spec = spec.and(hasType(params.getType()));
        if (params.getCategoryId() != null) spec = spec.and(hasCategory(params.getCategoryId()));
        if (params.getDateFrom()   != null) spec = spec.and(onOrAfter(params.getDateFrom()));
        if (params.getDateTo()     != null) spec = spec.and(onOrBefore(params.getDateTo()));
        if (params.getAmountMin()  != null) spec = spec.and(amountAtLeast(params.getAmountMin()));
        if (params.getAmountMax()  != null) spec = spec.and(amountAtMost(params.getAmountMax()));
        if (params.getSearch() != null && !params.getSearch().isBlank())
            spec = spec.and(descriptionContains(params.getSearch()));

        return spec;
    }
}
