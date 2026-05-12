package familycommandcenter.util;

import java.util.UUID;

public class AuthUser {

    private final int userId;
    private final String username;
    private final String role;
    private final UUID householdId;

    public AuthUser(
            int userId,
            String username,
            String role,
            UUID householdId) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.householdId = householdId;
    }

    public int getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public UUID getHouseholdId() {
        return householdId;
    }

    public boolean isParent() {
        return "parent".equalsIgnoreCase(role);
    }

    public boolean isKid() {
        return "kid".equalsIgnoreCase(role);
    }
}