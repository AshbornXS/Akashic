package org.registry.akashic.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.registry.akashic.domain.Book;
import org.registry.akashic.requests.BookPostRequestBody;
import org.registry.akashic.requests.BookPutRequestBody;

@Mapper
public interface BookMapper {
    BookMapper INSTANCE = Mappers.getMapper(BookMapper.class);

    @Mapping(source = "title", target = "title")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "imageData", target = "imageData")
    @Mapping(source = "imageName", target = "imageName")
    Book toBook(BookPostRequestBody bookPostRequestBody);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "imageData", target = "imageData")
    @Mapping(source = "imageName", target = "imageName")
    Book toBook(BookPutRequestBody bookPutRequestBody);
}