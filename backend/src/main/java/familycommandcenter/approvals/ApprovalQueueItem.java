package familycommandcenter.approvals;

import java.time.LocalDateTime;

public class ApprovalQueueItem {

    private int id;
    private ApprovalType approvalType;
    private int relatedRecordId;
    private ApprovalStatus status;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public ApprovalQueueItem() {
        // Needed for JSON mapping
    }

    public ApprovalQueueItem(
            int id,
            ApprovalType approvalType,
            int relatedRecordId,
            ApprovalStatus status,
            String title,
            String message,
            LocalDateTime createdAt,
            LocalDateTime reviewedAt) {

        this.id = id;
        this.approvalType = approvalType;
        this.relatedRecordId = relatedRecordId;
        this.status = status;
        this.title = title;
        this.message = message;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    public int getId() {
        return id;
    }

    public ApprovalType getApprovalType() {
        return approvalType;
    }

    public int getRelatedRecordId() {
        return relatedRecordId;
    }

    public ApprovalStatus getStatus() {
        return status;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setApprovalType(ApprovalType approvalType) {
        this.approvalType = approvalType;
    }

    public void setRelatedRecordId(int relatedRecordId) {
        this.relatedRecordId = relatedRecordId;
    }

    public void setStatus(ApprovalStatus status) {
        this.status = status;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}