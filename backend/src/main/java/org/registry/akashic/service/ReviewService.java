package org.registry.akashic.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.registry.akashic.domain.Review;
import org.registry.akashic.exception.BadRequestException;
import org.registry.akashic.mapper.ReviewMapper;
import org.registry.akashic.repository.ReviewRepository;
import org.registry.akashic.requests.ReviewPostRequestBody;
import org.registry.akashic.requests.ReviewPutRequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Log4j2
@RequiredArgsConstructor
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    public Review addReview(ReviewPostRequestBody reviewPostRequestBody) {
        Review review = ReviewMapper.INSTANCE.toReview(reviewPostRequestBody);
        return reviewRepository.save(review);
    }

    public Review updateReview(ReviewPutRequestBody reviewPutRequestBody) {
        if (reviewPutRequestBody.getId() == null) {
            throw new BadRequestException("Review ID cannot be null");
        }

        if (reviewRepository.findById(reviewPutRequestBody.getId()).isEmpty()) {
            throw new BadRequestException("Review not Found");
        }

        Review review = ReviewMapper.INSTANCE.toReview(reviewPutRequestBody);
        return reviewRepository.save(review);
    }

    public void likeReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Review not Found"));
        review.setLikes(review.getLikes() + 1);
        reviewRepository.save(review);
    }

    public void dislikeReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Review not Found"));
        review.setDislikes(review.getDislikes() + 1);
        reviewRepository.save(review);
    }

    public void removeLike(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Review not Found"));
        if (review.getLikes() > 0) {
            review.setLikes(review.getLikes() - 1);
            reviewRepository.save(review);
        }
    }

    public void removeDislike(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Review not Found"));
        if (review.getDislikes() > 0) {
            review.setDislikes(review.getDislikes() - 1);
            reviewRepository.save(review);
        }
    }

    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    public Optional<Review> getReviewByBookIdAndUserId(Long bookId, Long userId) {
        return reviewRepository.findByBookIdAndUserId(bookId, userId);
    }

    public void deleteReview(Long id) {
        reviewRepository.delete(reviewRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Review not Found")));
    }
}
