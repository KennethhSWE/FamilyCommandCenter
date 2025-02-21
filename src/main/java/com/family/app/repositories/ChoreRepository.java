package com.family.app.repositories;

import com.family.app.entity.Chore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ChoreRepository extends JpaRepository<Chore, Long> {

    List<Chore> findByAssignedToAndCompletedFalseAndDayAssigned(String addignedTo, LocalDate dayAssigned);  // Find uncompleted chores


// Method to find chores by who they are assigned to 
List<Chore> findByAssignedTo(String assignedTo);

}