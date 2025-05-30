package familycommandcenter.model;

import java.util.List;

public class FamilyData {
    private static List<FamilyMember> familyMembers;

    public static List<FamilyMember> getFamilyMembers() {
        if (familyMembers == null) {
            familyMembers = List.of(
                new FamilyMember("Austin Alexander", "Child"),
                new FamilyMember("Ella Hayes", "Child"),
                new FamilyMember("Lincoln Hayes", "Child"),
                new FamilyMember("Kenneth Hayes", "Parent"),
                new FamilyMember("Danielle Hayes", "Parent")
            );
        }
        return familyMembers;
    }
}
