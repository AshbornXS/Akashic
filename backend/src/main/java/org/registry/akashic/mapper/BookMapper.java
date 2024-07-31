package org.registry.akashic.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.registry.akashic.domain.Book;
import org.registry.akashic.requests.BookPostRequestBody;
import org.registry.akashic.requests.BookPutRequestBody;

@Mapper(componentModel = "spring")
public abstract class BookMapper {
    public static final BookMapper INSTANCE = Mappers.getMapper(BookMapper.class);

    public abstract Book toBook(BookPostRequestBody bookPostRequestBody);

    public abstract Book toBook(BookPutRequestBody bookPutRequestBody);
}
