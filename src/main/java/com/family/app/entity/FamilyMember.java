package com.family.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String relationship; // e.g., Father, Mother, Son, Daughter

    private String phoneNumber;
    private String email;
    private boolean isAdmin; // For permissions in the app

    @Column(nullable = true)
    private Integer totalPoints = 0; // Track earned/spent points

    @Column(nullable = true)
    private Integer bankedPoints = 0; // Track banked points

    // A list of chores assigned to this family member
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Chore> chorePool;

    // Update FamilyMember with new details
    public void updateFrom(FamilyMember familyMemberDetails) {
        this.firstName = familyMemberDetails.getFirstName();
        this.lastName = familyMemberDetails.getLastName();
        this.relationship = familyMemberDetails.getRelationship();
        this.phoneNumber = familyMemberDetails.getPhoneNumber();
        this.email = familyMemberDetails.getEmail();
        this.isAdmin = familyMemberDetails.isAdmin();
    }

    // Methods for managing points
    public void addPoints(int points) {
        this.totalPoints += points;
    }

    public void spendPoints(int points) {
        this.totalPoints -= points;
    }

    public void deductBankedPoints(int points) {
        this.bankedPoints -= points;
    }

    public void assignChore(Chore chore) {
        this.chorePool.add(chore);
    }
}
