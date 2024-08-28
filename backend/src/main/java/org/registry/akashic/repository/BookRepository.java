package org.registry.akashic.repository;

import org.registry.akashic.domain.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("SELECT DISTINCT b.tags FROM Book b")
    List<String> findAllTags();
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Book> findByTagsContainingIgnoreCase(String tag, Pageable pageable);
}