package com.fintech.dashboard.record.infrastructure.projection;

/**
 * Spring Data projection for the per-category monthly trend query.
 * Used by the dashboard "category trend" bar-chart endpoint.
 */
public interface CategoryTrendProjection {
    Integer getYear();
    Integer getMonth();
    Long getTotal();
}
