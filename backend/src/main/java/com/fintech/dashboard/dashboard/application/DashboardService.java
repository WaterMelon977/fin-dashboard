package com.fintech.dashboard.dashboard.application;

import com.fintech.dashboard.category.domain.Category;
import com.fintech.dashboard.category.infrastructure.CategoryRepository;
import com.fintech.dashboard.dashboard.application.dto.*;
import com.fintech.dashboard.record.application.dto.RecordFilterParams;
import com.fintech.dashboard.record.application.dto.RecordResponse;
import com.fintech.dashboard.record.domain.FinancialRecord;
import com.fintech.dashboard.record.domain.RecordType;
import com.fintech.dashboard.record.infrastructure.FinancialRecordRepository;
import com.fintech.dashboard.record.infrastructure.projection.CategoryTrendProjection;
import com.fintech.dashboard.record.infrastructure.projection.MonthlyCategorySummary;
import com.fintech.dashboard.record.infrastructure.projection.MonthlyTypeSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final String CURRENCY = "INR";
    private static final DateTimeFormatter MONTH_LABEL_FMT =
            DateTimeFormatter.ofPattern("MMM yyyy");

    private final FinancialRecordRepository recordRepository;
    private final CategoryRepository         categoryRepository;

    // =========================================================================
    // 1. MONTHLY SUMMARY — all roles
    //    GET /dashboard/summary          → all available months (no year filter)
    //    GET /dashboard/summary?year=N   → that year only
    // =========================================================================

    /**
     * Returns all available months across all years, ordered chronologically.
     * Used when the frontend needs a full-history timeline / bar chart.
     */
    public List<MonthlySummary> getAllMonthlySummaries() {
        return pivot(recordRepository.findAllMonthlyTypeSummary());
    }

    /**
     * Returns months within a specific year only.
     */
    public List<MonthlySummary> getMonthlySummaries(int year) {
        return pivot(recordRepository.findMonthlyTypeSummary(year));
    }

    // =========================================================================
    // 2. MONTHLY BREAKDOWN — analyst + admin
    //    GET /dashboard/breakdown?year=N
    //    Each month carries separate incomeBreakdowns and expenseBreakdowns.
    // =========================================================================

    public List<MonthlyBreakdown> getMonthlyBreakdowns(int year) {
        List<MonthlyTypeSummary>     summaryRaw   = recordRepository.findMonthlyTypeSummary(year);
        List<MonthlyCategorySummary> breakdownRaw = recordRepository.findMonthlyCategorySummary(year);

        // Batch-fetch category names — 1 extra query
        Set<Long> categoryIds = breakdownRaw.stream()
                .map(MonthlyCategorySummary::getCategoryId)
                .collect(Collectors.toSet());
        Map<Long, String> categoryNames = categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        // Pivot totals by month
        Map<Integer, long[]> totalPivot = new TreeMap<>();  // [income, expense]
        for (MonthlyTypeSummary row : summaryRaw) {
            long[] t = totalPivot.computeIfAbsent(row.getMonth(), k -> new long[2]);
            if (row.getType() == RecordType.INCOME) t[0] += row.getTotal();
            else                                     t[1] += row.getTotal();
        }

        // Group category rows by month, then split by type
        Map<Integer, List<MonthlyCategorySummary>> byMonth = new TreeMap<>();
        for (MonthlyCategorySummary row : breakdownRaw) {
            byMonth.computeIfAbsent(row.getMonth(), k -> new ArrayList<>()).add(row);
        }

        // Record count per month
        Map<Integer, Long> recordCounts = breakdownRaw.stream()
                .collect(Collectors.groupingBy(
                        MonthlyCategorySummary::getMonth,
                        Collectors.summingLong(MonthlyCategorySummary::getRecordCount)));

        return totalPivot.entrySet().stream()
                .map(e -> {
                    int  m       = e.getKey();
                    long income  = e.getValue()[0];
                    long expense = e.getValue()[1];

                    List<MonthlyCategorySummary> monthRows =
                            byMonth.getOrDefault(m, List.of());

                    List<CategoryBreakdown> incomeBreakdowns = monthRows.stream()
                            .filter(c -> c.getType() == RecordType.INCOME)
                            .map(c -> toCategoryBreakdown(c, categoryNames))
                            .toList();

                    List<CategoryBreakdown> expenseBreakdowns = monthRows.stream()
                            .filter(c -> c.getType() == RecordType.EXPENSE)
                            .map(c -> toCategoryBreakdown(c, categoryNames))
                            .toList();

                    return new MonthlyBreakdown(
                            year, m, label(year, m),
                            income, expense, income - expense, CURRENCY,
                            incomeBreakdowns, expenseBreakdowns,
                            recordCounts.getOrDefault(m, 0L));
                })
                .toList();
    }

    // =========================================================================
    // 3. CATEGORY TREND — analyst + admin
    //    GET /dashboard/category-trend?categoryId=1&type=EXPENSE
    //    One data point per month, for bar chart rendering.
    // =========================================================================

    public List<CategoryTrendPoint> getCategoryTrend(Long categoryId, RecordType type) {
        List<CategoryTrendProjection> raw = recordRepository.findCategoryTrend(categoryId, type);
        return raw.stream()
                .map(r -> new CategoryTrendPoint(
                        r.getYear(), r.getMonth(),
                        label(r.getYear(), r.getMonth()),
                        r.getTotal(), CURRENCY))
                .toList();
    }

    // =========================================================================
    // 4. RECENT TRANSACTIONS — analyst + admin
    //    GET /dashboard/recent?limit=10
    // =========================================================================

    public List<RecordResponse> getRecentTransactions(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        Pageable pageable = PageRequest.of(0, safeLimit,
                Sort.by(Sort.Direction.DESC, "transactionDate"));

        List<FinancialRecord> records = recordRepository.findAll(pageable).getContent();

        // Batch-fetch category names
        Set<Long> categoryIds = records.stream()
                .map(FinancialRecord::getCategoryId)
                .collect(Collectors.toSet());
        Map<Long, String> names = categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        return records.stream()
                .map(r -> RecordResponse.from(r, names.getOrDefault(r.getCategoryId(), "Unknown")))
                .toList();
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    /** Pivot a raw type-summary list into MonthlySummary objects. */
    private List<MonthlySummary> pivot(List<MonthlyTypeSummary> raw) {
        // LinkedHashMap preserves insertion order (which matches query ORDER BY)
        Map<String, long[]> map = new LinkedHashMap<>();
        for (MonthlyTypeSummary row : raw) {
            String key = row.getYear() + "-" + String.format("%02d", row.getMonth());
            long[] t = map.computeIfAbsent(key, k -> new long[]{row.getYear(), row.getMonth(), 0, 0});
            if (row.getType() == RecordType.INCOME) t[2] += row.getTotal();
            else                                     t[3] += row.getTotal();
        }
        return map.values().stream()
                .map(t -> {
                    int  y = (int) t[0];
                    int  m = (int) t[1];
                    long income  = t[2];
                    long expense = t[3];
                    return new MonthlySummary(y, m, label(y, m),
                            income, expense, income - expense, CURRENCY);
                })
                .toList();
    }

    private CategoryBreakdown toCategoryBreakdown(MonthlyCategorySummary c,
                                                   Map<Long, String> categoryNames) {
        return new CategoryBreakdown(
                c.getCategoryId(),
                categoryNames.getOrDefault(c.getCategoryId(), "Unknown"),
                c.getType().name(),
                c.getTotal(),
                CURRENCY,
                c.getRecordCount());
    }

    private String label(int year, int month) {
        return YearMonth.of(year, month).format(MONTH_LABEL_FMT);
    }
}
