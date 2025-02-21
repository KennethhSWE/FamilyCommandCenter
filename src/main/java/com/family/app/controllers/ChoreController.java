package com.family.app.controllers;

import com.family.app.entity.Chore;
import com.family.app.service.ChoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chores")
public class ChoreController {

    private final ChoreService choreService;

    public ChoreController(ChoreService choreService) {
        this.choreService = choreService;
    }

    // 1. Get All Chores
    @GetMapping
    public List<Chore> getAllChores() {
        return choreService.getAllChores();
    }

    // 2. Get Chore by ID
    @GetMapping("/{id}")
    public ResponseEntity<Chore> getChoreById(@PathVariable Long id) {
        return choreService.getChoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Add New Chore
    @PostMapping
    public ResponseEntity<Chore> createChore(@RequestBody Chore chore) {
        return new ResponseEntity<>(choreService.addChore(chore), HttpStatus.CREATED);
    }

    // 4. Update Chore
    @PutMapping("/{id}")
    public ResponseEntity<Chore> updateChore(@PathVariable Long id, @RequestBody Chore updatedChore) {
        Optional<Chore> existingChore = choreService.getChoreById(id);
        if (existingChore.isPresent()) {
            Chore chore = existingChore.get();
            chore.setName(updatedChore.getName());
            chore.setAssignedTo(updatedChore.getAssignedTo());
            chore.setCompleted(updatedChore.isCompleted());
            chore.setPoints(updatedChore.getPoints());
            return ResponseEntity.ok(choreService.addChore(chore));
        }
        return ResponseEntity.notFound().build();
    }

    // 5. Delete Chore
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChore(@PathVariable Long id) {
        choreService.deleteChore(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Get Chores my AssignedTo IE: Austin
    @GetMapping("/assigned/{assignedTo}")
    public ResponseEntity<List<Chore>> getChoresByAssignedTo(@PathVariable String assignedTo) {
        List<Chore> chores = choreService.getChoresByAssignedTo(assignedTo);
        if (chores.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
    return ResponseEntity.ok(chores);
    }
}