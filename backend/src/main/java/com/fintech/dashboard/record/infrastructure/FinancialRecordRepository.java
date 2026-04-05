package com.fintech.dashboard.record.infrastructure;

import com.fintech.dashboard.record.domain.FinancialRecord;
import com.fintech.dashboard.record.domain.RecordType;
import com.fintech.dashboard.record.infrastructure.projection.CategoryTrendProjection;
import com.fintech.dashboard.record.infrastructure.projection.MonthlyCategorySummary;
import com.fintech.dashboard.record.infrastructure.projection.MonthlyTypeSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialRecordRepository
        extends JpaRepository<FinancialRecord, Long>,
                JpaSpecificationExecutor<FinancialRecord> {

    // -------------------------------------------------------------------------
    // Year-scoped monthly aggregates (used by /dashboard/breakdown)
    // -------------------------------------------------------------------------

    @Query("""
            SELECT YEAR(r.transactionDate)  AS year,
                   MONTH(r.transactionDate) AS month,
                   r.type                   AS type,
                   SUM(r.amountPaise)       AS total
            FROM FinancialRecord r
            WHERE YEAR(r.transactionDate) = :year
            GROUP BY YEAR(r.transactionDate), MONTH(r.transactionDate), r.type
            ORDER BY MONTH(r.transactionDate) ASC
            """)
    List<MonthlyTypeSummary> findMonthlyTypeSummary(@Param("year") int year);

    @Query("""
            SELECT YEAR(r.transactionDate)  AS year,
                   MONTH(r.transactionDate) AS month,
                   r.categoryId             AS categoryId,
                   r.type                   AS type,
                   SUM(r.amountPaise)       AS total,
                   COUNT(r.id)              AS recordCount
            FROM FinancialRecord r
            WHERE YEAR(r.transactionDate) = :year
            GROUP BY YEAR(r.transactionDate), MONTH(r.transactionDate), r.categoryId, r.type
            ORDER BY MONTH(r.transactionDate) ASC, SUM(r.amountPaise) DESC
            """)
    List<MonthlyCategorySummary> findMonthlyCategorySummary(@Param("year") int year);

    // -------------------------------------------------------------------------
    // All-time monthly aggregate (used by /dashboard/summary with no year param)
    // -------------------------------------------------------------------------

    /**
     * Same shape as findMonthlyTypeSummary but covers all years.
     * Returns data ordered chronologically for a continuous frontend timeline.
     */
    @Query("""
            SELECT YEAR(r.transactionDate)  AS year,
                   MONTH(r.transactionDate) AS month,
                   r.type                   AS type,
                   SUM(r.amountPaise)       AS total
            FROM FinancialRecord r
            GROUP BY YEAR(r.transactionDate), MONTH(r.transactionDate), r.type
            ORDER BY YEAR(r.transactionDate) ASC, MONTH(r.transactionDate) ASC
            """)
    List<MonthlyTypeSummary> findAllMonthlyTypeSummary();

    // -------------------------------------------------------------------------
    // Category trend (used by /dashboard/category-trend — bar chart)
    // -------------------------------------------------------------------------

    /**
     * For a single category + record type, returns one row per month that has data.
     * Covers all years so the chart can display the full history.
     */
    @Query("""
            SELECT YEAR(r.transactionDate)  AS year,
                   MONTH(r.transactionDate) AS month,
                   SUM(r.amountPaise)       AS total
            FROM FinancialRecord r
            WHERE r.categoryId = :categoryId
              AND r.type       = :type
            GROUP BY YEAR(r.transactionDate), MONTH(r.transactionDate)
            ORDER BY YEAR(r.transactionDate) ASC, MONTH(r.transactionDate) ASC
            """)
    List<CategoryTrendProjection> findCategoryTrend(
            @Param("categoryId") Long categoryId,
            @Param("type") RecordType type);

    @Query("""
            SELECT YEAR(r.transactionDate)  AS year,
                   MONTH(r.transactionDate) AS month,
                   SUM(r.amountPaise)       AS total
            FROM FinancialRecord r
            WHERE r.categoryId = :categoryId
            GROUP BY YEAR(r.transactionDate), MONTH(r.transactionDate)
            ORDER BY YEAR(r.transactionDate) ASC, MONTH(r.transactionDate) ASC
            """)
    List<CategoryTrendProjection> findCategoryTrend(@Param("categoryId") Long categoryId);
}
