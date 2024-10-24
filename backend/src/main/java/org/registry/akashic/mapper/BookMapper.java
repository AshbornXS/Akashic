package org.registry.akashic.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.registry.akashic.domain.Book;
import org.registry.akashic.requests.BookGetResponse;
import org.registry.akashic.requests.BookPostRequestBody;
import org.registry.akashic.requests.BookPutRequestBody;
import org.springframework.data.domain.Page;

@Mapper
public interface BookMapper {
    BookMapper INSTANCE = Mappers.getMapper(BookMapper.class);

    @Mapping(source = "title", target = "title")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "tags", target = "tags")
    @Mapping(source = "imageData", target = "imageData")
    @Mapping(source = "imageName", target = "imageName")
    Book toBook(BookPostRequestBody bookPostRequestBody);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "tags", target = "tags")
    @Mapping(source = "imageData", target = "imageData")
    @Mapping(source = "imageName", target = "imageName")
    Book toBook(BookPutRequestBody bookPutRequestBody);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "tags", target = "tags")
    @Mapping(source = "imageData", target = "imageData")
    @Mapping(source = "imageName", target = "imageName")
    BookGetResponse toBookGetResponse(Book book);


    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "tags", target = "tags")
    @Mapping(source = "imageData", target = "imageData")
    @Mapping(source = "imageName", target = "imageName")
    default Page<BookGetResponse> toBookGetResponsePage(Page<Book> books) {
        return books.map(this::toBookGetResponse);
    }
}