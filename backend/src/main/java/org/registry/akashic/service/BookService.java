package org.registry.akashic.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.registry.akashic.domain.Book;
import org.registry.akashic.exception.BadRequestException;
import org.registry.akashic.mapper.BookMapper;
import org.registry.akashic.repository.BookRepository;
import org.registry.akashic.requests.BookPostRequestBody;
import org.registry.akashic.requests.BookPutRequestBody;
import org.registry.akashic.util.ImageUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Log4j2
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public Page<Book> listAll(Pageable pageable) {
        bookRepository.findAll(pageable).forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findAll(pageable);
    }

    public List<Book> listAllNonPageable() {
        bookRepository.findAll().forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findAll();
    }

    public Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable) {
        bookRepository.findAll(pageable).forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    public Book findByIdOrThrowBadRequestException(long id) {
        bookRepository.findAll().forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Book not Found"));
    }

    public Page<Book> findByTagsContainingIgnoreCase(String tags, Pageable pageable) {
        bookRepository.findAll(pageable).forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findByTagsContainingIgnoreCase(tags, pageable);
    }

    public String findAllTags() {
        List<String> tagsList = bookRepository.findAllTags();
        Set<String> uniqueTags = new HashSet<>();
        for (String tags : tagsList) {
            String[] splitTags = tags.split(",");
            for (String tag : splitTags) {
                uniqueTags.add(tag.trim());
            }
        }
        return uniqueTags.stream().collect(Collectors.joining(", "));
    }

    @Transactional
    public Book save(BookPostRequestBody bookPostRequestBody, MultipartFile imageFile) throws IOException {
        Book book = BookMapper.INSTANCE.toBook(bookPostRequestBody);
        log.warn("Book: {}", book);
        log.warn("Book Post Request Body: {}", bookPostRequestBody);
        if (imageFile != null && !imageFile.isEmpty()) {
            byte[] compressedImage = ImageUtil.compressImage(imageFile.getBytes());
            String imageName = book.getTitle().replaceAll("\\s+", "_") + ".jpg";
            book.setImageData(compressedImage);
            book.setImageName(imageName);
        }
        return bookRepository.save(book);
    }

    public void replace(BookPutRequestBody bookPutRequestBody) {
        Book savedBook = bookRepository.findById(bookPutRequestBody.getId())
                .orElseThrow(() -> new BadRequestException("Book not Found"));
        Book book = BookMapper.INSTANCE.toBook(bookPutRequestBody);
        book.setId(savedBook.getId());
        bookRepository.save(book);
    }

    public void delete(long id) {
        bookRepository.delete(bookRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Book not Found")));
    }

}
