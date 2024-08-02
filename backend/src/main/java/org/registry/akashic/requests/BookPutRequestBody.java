package org.registry.akashic.requests;

import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookPutRequestBody {
    private Long id;

    @NotEmpty(message = "The book title cannot be empty")
    private String title;

    @NotEmpty(message = "The book author cannot be empty")
    private String author;
}