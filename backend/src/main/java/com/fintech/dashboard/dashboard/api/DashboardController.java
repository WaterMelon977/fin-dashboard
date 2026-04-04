package com.fintech.dashboard.dashboard.api;

import com.fintech.dashboard.common.response.ApiResponse;
import com.fintech.dashboard.dashboard.application.DashboardService;
import com.fintech.dashboard.dashboard.application.dto.CategoryTrendPoint;
import com.fintech.dashboard.dashboard.application.dto.MonthlyBreakdown;
import com.fintech.dashboard.dashboard.application.dto.MonthlySummary;
import com.fintech.dashboard.record.application.dto.RecordResponse;
import com.fintech.dashboard.record.domain.RecordType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // =========================================================================
    // GET /dashboard/summary
    // ALL roles (viewer, analyst, admin)
    //
    // ?year=2024   → summaries for that year only
    // (no year)    → all available months across all years (for full timeline)
    // =========================================================================
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MonthlySummary>>> getMonthlySummary(
            @RequestParam(required = false) Integer year) {
        List<MonthlySummary> data = (year != null)
                ? dashboardService.getMonthlySummaries(year)
                : dashboardService.getAllMonthlySummaries();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // =========================================================================
    // GET /dashboard/breakdown?year=2024
    // ANALYST + ADMIN only
    //
    // Returns per-month breakdown with separate incomeBreakdowns and
    // expenseBreakdowns lists so the frontend can render two distinct charts.
    // =========================================================================
    @GetMapping("/breakdown")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<MonthlyBreakdown>>> getMonthlyBreakdown(
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : java.time.Year.now().getValue();
        return ResponseEntity.ok(
                ApiResponse.success(dashboardService.getMonthlyBreakdowns(targetYear)));
    }

    // =========================================================================
    // GET /dashboard/category-trend?categoryId=1&type=EXPENSE
    // ANALYST + ADMIN only
    //
    // Returns one data point per month for the given category + type.
    // Designed for bar charts — covers all years (full history).
    // =========================================================================
    @GetMapping("/category-trend")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryTrendPoint>>> getCategoryTrend(
            @RequestParam Long categoryId,
            @RequestParam RecordType type) {
        return ResponseEntity.ok(
                ApiResponse.success(dashboardService.getCategoryTrend(categoryId, type)));
    }

    // =========================================================================
    // GET /dashboard/recent?limit=10
    // ANALYST + ADMIN only
    //
    // Returns the last N transactions ordered by transactionDate DESC.
    // limit is capped at 50 in the service layer.
    // =========================================================================
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RecordResponse>>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(
                ApiResponse.success(dashboardService.getRecentTransactions(limit)));
    }
}
