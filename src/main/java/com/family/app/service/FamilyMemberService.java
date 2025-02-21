package com.family.app.service;

import com.family.app.entity.FamilyMember;
import com.family.app.repositories.FamilyMemberRepository;

import org.hibernate.type.descriptor.jdbc.JdbcTypeFamilyInformation.Family;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FamilyMemberService {

    private final FamilyMemberRepository repository;

    public FamilyMemberService(FamilyMemberRepository repository) {
        this.repository = repository;
    }

    public List<FamilyMember> getAllMembers() {
        return repository.findAll();
    }

    public Optional<FamilyMember> getMemberById(Long id) {
        return repository.findById(id);
    }

    public FamilyMember addMember(FamilyMember member) {
        return repository.save(member);
    }

    public FamilyMember updateMember(FamilyMember member) {
        return repository.save(member);
    }

    public void deleteMember(Long id) {
        repository.deleteById(id);
    }
}
