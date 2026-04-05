package com.fintech.dashboard.record.application.dto;

import com.fintech.dashboard.record.domain.FinancialRecord;
import com.fintech.dashboard.record.domain.RecordType;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
public class RecordResponse {

    Long id;
    Long userId;
    Long categoryId;
    String categoryName;
    Long amountPaise;
    String currency;
    RecordType type;
    LocalDate transactionDate;
    String description;
    String notes;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Long createdBy;

    public static RecordResponse from(FinancialRecord record, String categoryName) {
        return new RecordResponse(
                record.getId(),
                record.getUserId(),
                record.getCategoryId(),
                categoryName,
                record.getAmountPaise(),
                record.getCurrency(),
                record.getType(),
                record.getTransactionDate(),
                record.getDescription(),
                record.getNotes(),
                record.getCreatedAt(),
                record.getUpdatedAt(),
                record.getCreatedBy()
        );
    }
}
