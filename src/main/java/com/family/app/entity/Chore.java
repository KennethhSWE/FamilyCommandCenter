package com.family.app.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Chore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Example: "Load Dishwasher"
    private String assignedTo;
    private boolean completed = false;
    private int points;

    @Column(nullable = false) // Ensures this field is always populated
    private LocalDate dayAssigned = LocalDate.now();

    public LocalDate getDayAssigned() {
        return dayAssigned;
    }

    public void setDayAssigned(LocalDate dayAssigned) {
        this.dayAssigned = dayAssigned;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAssignedTo() { return assignedTo; }
    public boolean isCompleted() { return completed; }
    public int getPoints() { return points; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public void setPoints(int points) { this.points = points; }
}


