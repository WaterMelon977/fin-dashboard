package com.fintech.dashboard.record.infrastructure.projection;

import com.fintech.dashboard.record.domain.RecordType;

/**
 * Spring Data projection for the monthly category breakdown aggregate query.
 */
public interface MonthlyCategorySummary {
    Integer getYear();
    Integer getMonth();
    Long getCategoryId();
    RecordType getType();
    Long getTotal();
    Long getRecordCount();
}
