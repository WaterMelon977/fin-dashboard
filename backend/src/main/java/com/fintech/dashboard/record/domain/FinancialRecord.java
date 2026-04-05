package com.fintech.dashboard.record.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_records")
@SQLRestriction("is_deleted = false")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FinancialRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Column(nullable = false, length = 3, columnDefinition = "char(3)")
    @JdbcTypeCode(Types.CHAR)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RecordType type;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    // -------------------------------------------------------------------------
    // Factory — the only way to create a new record
    // -------------------------------------------------------------------------
    public static FinancialRecord create(Long userId, Long categoryId, Long amountPaise,
                                         String currency, RecordType type,
                                         LocalDate transactionDate,
                                         String description, String notes,
                                         Long createdBy) {
        return FinancialRecord.builder()
                .userId(userId)
                .categoryId(categoryId)
                .amountPaise(amountPaise)
                .currency(currency)
                .type(type)
                .transactionDate(transactionDate)
                .description(description)
                .notes(notes)
                .isDeleted(false)
                .createdBy(createdBy)
                .build();
    }

    // -------------------------------------------------------------------------
    // Domain behaviour — only the 4 allowed editable fields
    // -------------------------------------------------------------------------
    public void update(Long amountPaise, Long categoryId, String description,
                       String notes, Long updatedBy) {
        if (amountPaise != null)  this.amountPaise  = amountPaise;
        if (categoryId  != null)  this.categoryId   = categoryId;
        if (description != null)  this.description  = description;
        if (notes       != null)  this.notes        = notes;
        this.updatedBy = updatedBy;
    }

    // -------------------------------------------------------------------------
    // Soft delete — sets the three columns atomically inside the domain object.
    // The caller (service) is responsible for saving afterwards.
    // -------------------------------------------------------------------------
    public void softDelete(Long deletedBy) {
        if (this.isDeleted) {
            throw new IllegalStateException("Record is already deleted");
        }
        this.isDeleted  = true;
        this.deletedAt  = LocalDateTime.now();
        this.deletedBy  = deletedBy;
    }
}
