package com.fintech.dashboard.dashboard.application.dto;

import lombok.Value;

import java.util.List;

/**
 * Full analyst-level breakdown for one calendar month.
 * Income and expense categories are returned as separate lists so the
 * frontend can render distinct income-breakdown and expense-breakdown charts.
 */
@Value
public class MonthlyBreakdown {
    int year;
    int month;
    String monthLabel;
    long totalIncomePaise;
    long totalExpensePaise;
    long netBalancePaise;
    String currency;
    /** Per-category totals for INCOME transactions this month */
    List<CategoryBreakdown> incomeBreakdowns;
    /** Per-category totals for EXPENSE transactions this month */
    List<CategoryBreakdown> expenseBreakdowns;
    long recordCount;
}
