package familycommandcenter.model;

public class Chore {

    private String name;
    private String description;
    private boolean completed;

    public Chore(String name, String description, boolean completed) {
        this.name = name;
        this.description = description;
        this.completed = completed;
    }

    //Getters 
     public String getName() {
        return name;
    }   

     public String getDescription() {
        return description;
    }   

     public boolean isCompleted() {
        return completed;
    }

    //Setters
     public void setName(String name) {
        this.name = name;
    }   

     public void setDescription(String description) {
        this.description = description;
    }   

     public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}

