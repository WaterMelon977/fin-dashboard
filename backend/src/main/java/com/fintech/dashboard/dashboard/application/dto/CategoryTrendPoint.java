package com.fintech.dashboard.dashboard.application.dto;

import lombok.Value;

/**
 * One data point in a category's monthly trend series.
 * Designed for bar/line charts — one object per month that has data.
 */
@Value
public class CategoryTrendPoint {
    int year;
    int month;
    /** Human-readable label, e.g. "Aug 2024" */
    String monthLabel;
    long totalPaise;
    String currency;
}
