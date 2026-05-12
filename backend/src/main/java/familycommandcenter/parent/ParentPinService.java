package familycommandcenter.parent;

import familycommandcenter.util.PasswordUtils;

import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;

public class ParentPinService {

    private static final String STARTER_PARENT_PIN = "1234";

    private final ParentPinRepository parentPinRepository;

    public ParentPinService(ParentPinRepository parentPinRepository) {
        this.parentPinRepository = parentPinRepository;
    }

    public void makeSureStarterPinExists() throws SQLException {
        parentPinRepository.makeSureTableExists();
    }

    public void makeSureStarterPinExists(UUID householdId) throws SQLException {
        parentPinRepository.makeSureTableExists();

        if (!parentPinRepository.hasPin(householdId)) {
            String starterPinHash = PasswordUtils.hashPassword(STARTER_PARENT_PIN);
            parentPinRepository.saveFirstPinHash(starterPinHash, householdId);
        }
    }

    public boolean parentPinIsCorrect(
            String pin,
            UUID householdId) throws SQLException {

        if (pin == null || !pin.matches("\\d{4}")) {
            return false;
        }

        Optional<String> possibleHash = parentPinRepository.findPinHash(householdId);

        if (possibleHash.isEmpty()) {
            return false;
        }

        return PasswordUtils.checkPassword(pin, possibleHash.get());
    }

    public boolean changeParentPin(
            String currentPin,
            String newPin,
            UUID householdId) throws SQLException {

        if (!parentPinIsCorrect(currentPin, householdId)) {
            return false;
        }

        if (newPin == null || !newPin.matches("\\d{4}")) {
            return false;
        }

        String newPinHash = PasswordUtils.hashPassword(newPin);
        parentPinRepository.updatePinHash(newPinHash, householdId);

        return true;
    }

    public boolean setParentPinDuringSetup(
            String newPin,
            UUID householdId) throws SQLException {

        if (newPin == null || !newPin.matches("\\d{4}")) {
            return false;
        }

        String newPinHash = PasswordUtils.hashPassword(newPin);

        if (parentPinRepository.hasPin(householdId)) {
            parentPinRepository.updatePinHash(newPinHash, householdId);
        } else {
            parentPinRepository.saveFirstPinHash(newPinHash, householdId);
        }

        return true;
    }
}