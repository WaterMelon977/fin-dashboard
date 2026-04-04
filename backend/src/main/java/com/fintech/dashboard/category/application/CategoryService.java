package com.fintech.dashboard.category.application;

import com.fintech.dashboard.category.application.dto.CategoryResponse;
import com.fintech.dashboard.category.infrastructure.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findAllByIsActiveTrue()
                .stream()
                .map(CategoryResponse::new)
                .toList();
    }
}
