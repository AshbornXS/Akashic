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
import java.util.List;

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

    public List<Book> findByTitleContainingIgnoreCase(String title) {
        bookRepository.findAll().forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public Book findByIdOrThrowBadRequestException(long id) {
        bookRepository.findAll().forEach(book -> book.setImageData(ImageUtil.decompressImage(book.getImageData())));
        return bookRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Book not Found"));
    }

    @Transactional
    public Book save(BookPostRequestBody bookPostRequestBody, MultipartFile imageFile) throws IOException {
        Book book = BookMapper.INSTANCE.toBook(bookPostRequestBody);
        log.warn("Book: {}", book);
        log.warn("Book Post Request Body: {}", bookPostRequestBody);
        if (imageFile != null && !imageFile.isEmpty()) {
            byte[] compressedImage = ImageUtil.compressImage(imageFile.getBytes());
            String imageName = book.getTitle().replaceAll("\\s+", "_") + ".jpg";
            ImageUtil.saveImageToFile(compressedImage, imageName);
            book.setImageData(compressedImage);
            book.setImageName(imageName);
        }
        return bookRepository.save(book);
    }

    public void replace(BookPutRequestBody bookPutRequestBody) {
        Book savedBook = findByIdOrThrowBadRequestException(bookPutRequestBody.getId());
        Book book = BookMapper.INSTANCE.toBook(bookPutRequestBody);
        book.setId(savedBook.getId());
        bookRepository.save(book);
    }

    public void delete(long id) {
        bookRepository.delete(findByIdOrThrowBadRequestException(id));
    }

}
