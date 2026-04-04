package com.fintech.dashboard.category.application.dto;

import com.fintech.dashboard.category.domain.Category;
import com.fintech.dashboard.category.domain.CategoryType;
import lombok.Getter;

@Getter
public class CategoryResponse {

    private final Long id;
    private final String name;
    private final CategoryType type;
    private final String description;
    private final boolean isSystem;

    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.type = category.getType();
        this.description = category.getDescription();
        this.isSystem = category.isSystem();
    }
}
