package org.registry.akashic.client;

import lombok.extern.log4j.Log4j2;
import org.registry.akashic.domain.Book;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Log4j2
public class SpringClient {
    public static void main(String[] args) {
        ResponseEntity<Book> entity = new RestTemplate().getForEntity("http://localhost:8081/books/{id}", Book.class, 7);
        log.info(entity);

        Book object = new RestTemplate().getForObject("http://localhost:8081/books/{id}", Book.class, 7);

        log.info(object);

        Book[] books = new RestTemplate().getForObject("http://localhost:8081/books/all", Book[].class);

        log.info(Arrays.toString(books));
        //@formatter:off
        ResponseEntity<List<Book>> exchange = new RestTemplate().exchange("http://localhost:8081/books/all"
                ,HttpMethod.GET
                ,null
                , new ParameterizedTypeReference<>() {});
        //@formatter:on
        log.info(exchange.getBody());

//        Anime kingdom = Anime.builder().name("Kingdom").build();
//        Anime kingdomSaved = new RestTemplate().postForObject("http://localhost:8080/animes/", kingdom, Anime.class);
//        log.info("Saved anime '{}'", kingdomSaved);

        Book samuraiChamploo = Book.builder().title("Samurai Champloo").author("sla vei").build();
        ResponseEntity<Book> samuraiChamplooSaved = new RestTemplate().exchange("http://localhost:8081/books/",
                HttpMethod.POST,
                new HttpEntity<>(samuraiChamploo, httpJsonHeaders()),
                Book.class);
        log.info("Saved book '{}'", samuraiChamplooSaved);


        Book bookToBeUpdate = samuraiChamplooSaved.getBody();
        bookToBeUpdate.setTitle("Samurai Champloo 2");

        ResponseEntity<Void> samuraiChamplooUpdate = new RestTemplate().exchange("http://localhost:8081/books/",
                HttpMethod.PUT,
                new HttpEntity<>(bookToBeUpdate, httpJsonHeaders()),
                Void.class);

        log.info(samuraiChamplooUpdate);


        ResponseEntity<Void> samuraiChamplooDelete = new RestTemplate().exchange("http://localhost:8081/books/{id}",
                HttpMethod.DELETE,
                null,
                Void.class,
                bookToBeUpdate.getId());

        log.info(samuraiChamplooDelete);


    }

    private static HttpHeaders httpJsonHeaders(){
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        return httpHeaders;
    }
}
