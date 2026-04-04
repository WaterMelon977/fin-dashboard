package com.fintech.dashboard.dashboard.application.dto;

import lombok.Value;

/** Per-category aggregate within a single month. */
@Value
public class CategoryBreakdown {
    Long categoryId;
    String categoryName;
    /** "INCOME" or "EXPENSE" */
    String categoryType;
    long totalPaise;
    String currency;
    long transactionCount;
}
