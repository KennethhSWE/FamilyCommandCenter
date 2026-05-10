package familycommandcenter.parent;

import familycommandcenter.util.PasswordUtils;

import java.sql.SQLException;
import java.util.Optional;

public class ParentPinService {

    private static final String STARTER_PARENT_PIN = "1234";

    private final ParentPinRepository parentPinRepository;

    public ParentPinService(ParentPinRepository parentPinRepository) {
        this.parentPinRepository = parentPinRepository;
    }

    public void makeSureStarterPinExists() throws SQLException {
        parentPinRepository.makeSureTableExists();

        if (!parentPinRepository.hasPin()) {
            String starterPinHash = PasswordUtils.hashPassword(STARTER_PARENT_PIN);
            parentPinRepository.saveFirstPinHash(starterPinHash);
        }
    }

    public boolean parentPinIsCorrect(String pin) throws SQLException {
        if (pin == null || !pin.matches("\\d{4}")) {
            return false;
        }

        Optional<String> possibleHash = parentPinRepository.findPinHash();

        if (possibleHash.isEmpty()) {
            return false;
        }

        return PasswordUtils.checkPassword(pin, possibleHash.get());
    }

    public boolean changeParentPin(String currentPin, String newPin) throws SQLException {
        if (!parentPinIsCorrect(currentPin)) {
            return false;
        }

        if (newPin == null || !newPin.matches("\\d{4}")) {
            return false;
        }

        String newPinHash = PasswordUtils.hashPassword(newPin);
        parentPinRepository.updatePinHash(newPinHash);

        return true;
    }

    public boolean setParentPinDuringSetup(String newPin) throws SQLException {
        if (newPin == null || !newPin.matches("\\d{4}")) {
            return false;
        }

        String newPinHash = PasswordUtils.hashPassword(newPin);

        if (parentPinRepository.hasPin()) {
            parentPinRepository.updatePinHash(newPinHash);
        } else {
            parentPinRepository.saveFirstPinHash(newPinHash);
        }

        return true;
    }
}