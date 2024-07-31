package org.registry.akashic.requests;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookPostRequestBody {
    @NotEmpty(message = "The book name cannot be empty")
    @Schema(description = "This is the books's name", example = "Lord of The Rings", required = true)
    private String name;

    @NotEmpty(message = "The book author cannot be empty")
    @Schema(description = "This is the books's author", example = "J.R.R. Tolkien", required = true)
    private String author;


}
