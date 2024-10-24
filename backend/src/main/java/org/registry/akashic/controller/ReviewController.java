package org.registry.akashic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.registry.akashic.domain.Review;
import org.registry.akashic.requests.ReviewPostRequestBody;
import org.registry.akashic.requests.ReviewPutRequestBody;
import org.registry.akashic.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("reviews")
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody @Valid ReviewPostRequestBody reviewPostRequestBody) {
        return ResponseEntity.ok(reviewService.addReview(reviewPostRequestBody));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@RequestBody @Valid ReviewPutRequestBody reviewPutRequestBody) {
        return ResponseEntity.ok(reviewService.updateReview(reviewPutRequestBody));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/like")
    public ResponseEntity<Void> likeReview(@PathVariable Long id, @RequestParam(required = false) String remove) {
        if (remove != null) {
            reviewService.removeLike(id);
        } else {
            reviewService.likeReview(id);
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/dislike")
    public ResponseEntity<Void> dislikeReview(@PathVariable Long id, @RequestParam(required = false) String remove) {
        if (remove != null) {
            reviewService.removeDislike(id);
        } else {
            reviewService.dislikeReview(id);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Review>> getReviewsByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
    }

    @GetMapping("/book/{bookId}/user/{userId}")
    public ResponseEntity<Optional<Review>> getReviewByBookIdAndUserId(@PathVariable Long bookId, @PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewByBookIdAndUserId(bookId, userId));
    }
}