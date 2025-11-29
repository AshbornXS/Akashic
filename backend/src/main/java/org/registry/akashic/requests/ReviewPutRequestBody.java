package org.registry.akashic.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewPutRequestBody {
    @NotNull(message = "The review ID cannot be empty")
    @Min(value = 1, message = "The review ID must be greater than 0")
    @Schema(description = "This is the review's ID", example = "1", required = true)
    @JsonProperty("id")
    private Long id;

    @NotNull(message = "The user id cannot be empty")
    @Schema(description = "This is the user id", example = "1", required = true)
    @JsonProperty("userId")
    private Long userId;

    @NotNull(message = "The book id cannot be empty")
    @Schema(description = "This is the book id", example = "1", required = true)
    @JsonProperty("bookId")
    private Long bookId;

    @NotNull(message = "The rating cannot be empty")
    @Schema(description = "This is the rating", example = "5", required = true)
    @JsonProperty("rating")
    private int rating;

    @Size(max = 500)
    @Schema(description = "This is the comment", example = "This is a great book", required = false)
    @JsonProperty("comment")
    private String comment;

    @NotEmpty(message = "The username cannot be empty")
    @Schema(description = "This is the username", example = "John Doe", required = true)
    @JsonProperty("username")
    private String username;

    @NotNull(message = "The date cannot be empty")
    @Schema(description = "This is the date", example = "2021-09-01", required = true)
    @JsonProperty("date")
    private String date;
}