package com.family.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.family.app")
public class FamilyCommandCenterApplication {
    public static void main(String[] args) {
        SpringApplication.run(FamilyCommandCenterApplication.class, args);
        System.out.println("Family Command Center is up and running!");
    }
    
}
