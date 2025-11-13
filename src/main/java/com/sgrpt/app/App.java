package com.sgrpt.app; // <--- ¡Debe coincidir con el error!

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class App { // <--- ¡Debe llamarse App!
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}