package org.registry.akashic.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty(message = "The book title cannot be empty")
    private String title;
    @NotEmpty(message = "The book author cannot be empty")
    private String author;
    @NotEmpty(message = "The book description cannot be empty")
    @Size(max = 1000, message = "The book description must be less than 1000 characters")
    private String description;

    private String tags;

    @Lob
    @Column(name = "image_data", columnDefinition = "LONGBLOB")
    private byte[] imageData;
    private String imageName;

}