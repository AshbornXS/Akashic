package org.registry.akashic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.registry.akashic.domain.Book;
import org.registry.akashic.requests.BookPostRequestBody;
import org.registry.akashic.requests.BookPutRequestBody;
import org.registry.akashic.service.BookService;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("books")
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BookController {
    private final BookService bookService;

    @GetMapping
    @Operation(summary = "List all books paginated", description = "The default size is 20, use the parameter size " +
            "to change the default value", tags = {"book"} )
    public ResponseEntity<Page<Book>> list(@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(bookService.listAll(pageable));
    }

    @GetMapping(path = "/all")
    public ResponseEntity<List<Book>> listAll() {
        return ResponseEntity.ok(bookService.listAllNonPageable());
    }

    @GetMapping(path = "/search")
    public ResponseEntity<?> searchByIdOrName(@RequestParam(required = false) Long id, @RequestParam(required = false) String title) {
        if (id != null) {
            return ResponseEntity.ok(bookService.findByIdOrThrowBadRequestException(id));
        } else if (title != null) {
            return ResponseEntity.ok(bookService.findByTitleContainingIgnoreCase(title));
        } else {
            return ResponseEntity.badRequest().body("Either 'id' or 'title' must be provided");
        }
    }

    //**------------------- ADMIN AREA -------------------**//

    @RolesAllowed("ROLE_ADMIN")
    @PostMapping(path = "/admin")
    public ResponseEntity<Book> save(@RequestPart("book") @Valid BookPostRequestBody bookPostRequestBody,
                                     @RequestPart("image") MultipartFile imageFile) throws IOException {
        Book savedBook = bookService.save(bookPostRequestBody, imageFile);
        return new ResponseEntity<>(savedBook, HttpStatus.CREATED);
    }

    @RolesAllowed("ROLE_ADMIN")
    @PutMapping(path = "/admin")
    public ResponseEntity<Void> replace(@RequestBody BookPutRequestBody bookPutRequestBody) {
        bookService.replace(bookPutRequestBody);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RolesAllowed("ROLE_ADMIN")
    @DeleteMapping(path = "/admin/{id}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successful Operation"),
            @ApiResponse(responseCode = "400", description = "When book does is not exist in database")
    })
    public ResponseEntity<Void> delete(@PathVariable long id) {
        bookService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
