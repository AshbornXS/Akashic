package org.registry.akashic.repository;

import org.registry.akashic.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookId(Long bookId);
    Optional<Review> findByBookIdAndUserId(Long bookId, Long userId);
}