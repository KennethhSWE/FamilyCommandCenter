package com.family.app.controllers;

import com.family.app.entity.FamilyMember;
import com.family.app.service.FamilyMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/family-members")
public class FamilyMemberController {

    private final FamilyMemberService service;

    public FamilyMemberController(FamilyMemberService service) {
        this.service = service;
    }

    @GetMapping
    public List<FamilyMember> getAllFamilyMembers() {
        return service.getAllMembers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyMember> getFamilyMemberById(@PathVariable Long id) {
        return service.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<FamilyMember> updateFamilyMember(
            @PathVariable Long id, 
            @RequestBody FamilyMember familyMemberDetails) {

        Optional<FamilyMember> existingMember = service.getMemberById(id);
        if (existingMember.isPresent()) {
            FamilyMember member = existingMember.get();
            member.updateFrom(familyMemberDetails);
            FamilyMember updatedMember = service.updateMember(member);
            return ResponseEntity.ok(updatedMember);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<FamilyMember> addFamilyMember(@RequestBody FamilyMember member) {
        FamilyMember savedMember = service.addMember(member);
        return new ResponseEntity<>(savedMember, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamilyMember(@PathVariable Long id) {
        service.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
