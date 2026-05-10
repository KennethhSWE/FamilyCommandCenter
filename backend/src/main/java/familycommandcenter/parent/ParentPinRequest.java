package familycommandcenter.parent;

public class ParentPinRequest {

    private String pin;
    private String newPin;

    public ParentPinRequest() {
        // Needed for JSON mapping
    }

    public String getPin() {
        return pin;
    }

    public String getNewPin() {
        return newPin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }
}