package org.registry.akashic.mapper;

import org.junit.jupiter.api.Test;
import org.registry.akashic.domain.Book;
import org.registry.akashic.requests.BookPostRequestBody;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class BookMapperTest {

    @Test
    public void testToBook() {
        BookPostRequestBody bookPostRequestBody = BookPostRequestBody.builder()
                .title("Test Title")
                .author("Test Author")
                .build();

        Book book = BookMapper.INSTANCE.toBook(bookPostRequestBody);

        assertNotNull(book);
        assertEquals(bookPostRequestBody.getTitle(), book.getTitle());
        assertEquals(bookPostRequestBody.getAuthor(), book.getAuthor());
    }
}