package org.registry.akashic.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.registry.akashic.domain.Review;
import org.registry.akashic.requests.ReviewPostRequestBody;
import org.registry.akashic.requests.ReviewPutRequestBody;

@Mapper
public interface ReviewMapper {
    ReviewMapper INSTANCE = Mappers.getMapper(ReviewMapper.class);

    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "bookId", target = "bookId")
    @Mapping(source = "rating", target = "rating")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "date", target = "date")
    Review toReview(ReviewPostRequestBody reviewPostRequestBody);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "bookId", target = "bookId")
    @Mapping(source = "rating", target = "rating")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "date", target = "date")
    Review toReview(ReviewPutRequestBody reviewPutRequestBody);
}
