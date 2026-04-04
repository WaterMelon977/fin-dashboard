package com.fintech.dashboard.record.application.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * PUT /records/{id} body.
 * All four fields are optional — service rejects a request where every field is null.
 * Only these four fields are editable per the access policy.
 */
@Data
public class UpdateRecordRequest {

    @Positive(message = "Amount must be positive")
    private Long amountPaise;

    private Long categoryId;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String notes;
}
