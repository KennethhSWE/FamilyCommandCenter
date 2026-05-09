package familycommandcenter.chores;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ChoreAssignment {

    private int id;
    private int householdId;
    private int choreTemplateId;
    private int assignedKidId;
    private LocalDate assignedDate;
    private LocalDate dueDate;
    private int pointValue;
    private ChoreStatus status;
    private boolean carriedOver;
    private LocalDateTime kidMarkedDoneAt;
    private LocalDateTime parentReviewedAt;
    private Integer reviewedByParentId;

    public ChoreAssignment() {
        // Needed for JSON mapping
    }

    public ChoreAssignment(
            int id,
            int householdId,
            int choreTemplateId,
            int assignedKidId,
            LocalDate assignedDate,
            LocalDate dueDate,
            int pointValue,
            ChoreStatus status,
            boolean carriedOver,
            LocalDateTime kidMarkedDoneAt,
            LocalDateTime parentReviewedAt,
            Integer reviewedByParentId) {

        this.id = id;
        this.householdId = householdId;
        this.choreTemplateId = choreTemplateId;
        this.assignedKidId = assignedKidId;
        this.assignedDate = assignedDate;
        this.dueDate = dueDate;
        this.pointValue = pointValue;
        this.status = status;
        this.carriedOver = carriedOver;
        this.kidMarkedDoneAt = kidMarkedDoneAt;
        this.parentReviewedAt = parentReviewedAt;
        this.reviewedByParentId = reviewedByParentId;
    }

    public int getId() {
        return id;
    }

    public int getHouseholdId() {
        return householdId;
    }

    public int getChoreTemplateId() {
        return choreTemplateId;
    }

    public int getAssignedKidId() {
        return assignedKidId;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public int getPointValue() {
        return pointValue;
    }

    public ChoreStatus getStatus() {
        return status;
    }

    public boolean isCarriedOver() {
        return carriedOver;
    }

    public LocalDateTime getKidMarkedDoneAt() {
        return kidMarkedDoneAt;
    }

    public LocalDateTime getParentReviewedAt() {
        return parentReviewedAt;
    }

    public Integer getReviewedByParentId() {
        return reviewedByParentId;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setHouseholdId(int householdId) {
        this.householdId = householdId;
    }

    public void setChoreTemplateId(int choreTemplateId) {
        this.choreTemplateId = choreTemplateId;
    }

    public void setAssignedKidId(int assignedKidId) {
        this.assignedKidId = assignedKidId;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void setPointValue(int pointValue) {
        this.pointValue = pointValue;
    }

    public void setStatus(ChoreStatus status) {
        this.status = status;
    }

    public void setCarriedOver(boolean carriedOver) {
        this.carriedOver = carriedOver;
    }

    public void setKidMarkedDoneAt(LocalDateTime kidMarkedDoneAt) {
        this.kidMarkedDoneAt = kidMarkedDoneAt;
    }

    public void setParentReviewedAt(LocalDateTime parentReviewedAt) {
        this.parentReviewedAt = parentReviewedAt;
    }

    public void setReviewedByParentId(Integer reviewedByParentId) {
        this.reviewedByParentId = reviewedByParentId;
    }
}