package model;

public class Chore {

    Private String name;
    Private String description;
    Private boolean isCompleted;

    Chore(String name, String description, boolean isCompleted) {
        this.name = name;
        this.description = description;
        this.isCompleted = isCompleted;
    }

    String getName() {
        return this.name;
    }   

    String getDescription() {
        return this.description;
    }   

    boolean get.isCompleted() {
        return this.isCompleted;
    }
}

