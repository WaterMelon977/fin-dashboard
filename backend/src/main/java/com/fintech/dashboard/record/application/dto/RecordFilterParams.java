package com.fintech.dashboard.record.application.dto;

import com.fintech.dashboard.record.domain.RecordType;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Query-parameter DTO for {@code GET /records}.
 * All fields are optional — null fields produce no predicate.
 */
@Data
public class RecordFilterParams {

    private RecordType type;

    private Long categoryId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateTo;

    private Long amountMin;

    private Long amountMax;

    private String search;

    private int page = 0;

    private int size = 20;

    /** Format: {@code field,asc} or {@code field,desc} — e.g. {@code transactionDate,desc} */
    private String sort = "transactionDate,desc";
}
