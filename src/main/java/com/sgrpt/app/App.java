package com.sgrpt.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// [Comentario]: Esta anotación combina varias configuraciones y marca la clase como principal.
@SpringBootApplication 
public class App {
    // [Comentario]: El método main ejecuta la aplicación Spring Boot.
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}