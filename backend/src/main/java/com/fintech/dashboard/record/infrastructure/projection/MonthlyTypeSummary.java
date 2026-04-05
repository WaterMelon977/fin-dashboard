package com.fintech.dashboard.record.infrastructure.projection;

import com.fintech.dashboard.record.domain.RecordType;

/**
 * Spring Data projection for the monthly income/expense aggregate query.
 * Aliases in the JPQL SELECT clause must match the getter names here.
 */
public interface MonthlyTypeSummary {
    Integer getYear();
    Integer getMonth();
    RecordType getType();
    Long getTotal();
}
