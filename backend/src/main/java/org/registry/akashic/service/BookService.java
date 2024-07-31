package org.registry.akashic.service;

import lombok.RequiredArgsConstructor;
import org.registry.akashic.domain.Book;
import org.registry.akashic.exception.BadRequestException;
import org.registry.akashic.mapper.BookMapper;
import org.registry.akashic.repository.BookRepository;
import org.registry.akashic.requests.BookPostRequestBody;
import org.registry.akashic.requests.BookPutRequestBody;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public Page<Book> listAll(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public List<Book> listAllNonPageable() {
        return bookRepository.findAll();
    }

    public List<Book> findByNameContainingIgnoreCase(String name) {
        return bookRepository.findByNameContainingIgnoreCase(name);
    }

    public Book findByIdOrThrowBadRequestException(long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Book not Found"));
    }

    @Transactional
    public Book save(BookPostRequestBody bookPostRequestBody) {
        return bookRepository.save(BookMapper.INSTANCE.toBook(bookPostRequestBody));
    }

    public void delete(long id) {
        bookRepository.delete(findByIdOrThrowBadRequestException(id));
    }

    public void replace(BookPutRequestBody bookPutRequestBody) {
        Book savedBook = findByIdOrThrowBadRequestException(bookPutRequestBody.getId());
        Book book = BookMapper.INSTANCE.toBook(bookPutRequestBody);
        book.setId(savedBook.getId());
        bookRepository.save(book);
    }

}
