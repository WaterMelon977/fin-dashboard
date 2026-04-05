package com.fintech.dashboard.dashboard.application.dto;

import lombok.Value;

/**
 * Aggregated financial summary for one calendar month.
 * All monetary values are in paise (bigint). Currency is always stored
 * alongside so clients never have to guess the denomination.
 */
@Value
public class MonthlySummary {
    int year;
    int month;
    /** Human-readable label, e.g. "Aug 2024" */
    String monthLabel;
    long totalIncomePaise;
    long totalExpensePaise;
    /** totalIncomePaise - totalExpensePaise (can be negative) */
    long netBalancePaise;
    String currency;
}
