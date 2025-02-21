package com.family.app.service;


import com.family.app.entity.Chore;
import com.family.app.repositories.ChoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChoreService {
    
    private final ChoreRepository choreRepository;

    public ChoreService(ChoreRepository choreRepository) {
        this.choreRepository = choreRepository;
    }

    public List<Chore> getAllChores() {
        return choreRepository.findAll();
    }

    public Optional<Chore> getChoreById(Long id) {
        return choreRepository.findById(id);
    }

    public List<Chore> getChoresByAssignedTo(String assignedTo) {
        return choreRepository.findByAssignedTo(assignedTo);
    }

    public Chore addChore(Chore chore) {
        return choreRepository.save(chore);
    }

    public void deleteChore(Long id) {
        choreRepository.deleteById(id);
    }

    public Chore completeChore(Long id) {
        Optional<Chore> choreOptional = choreRepository.findById(id);
        if (choreOptional.isPresent()) {
            Chore chore = choreOptional.get();
            chore.setCompleted(true);
            return choreRepository.save(chore);
        } 
        return null;
    }
    
}
