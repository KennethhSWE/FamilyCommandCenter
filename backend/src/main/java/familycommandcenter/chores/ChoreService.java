package familycommandcenter.chores;

import familycommandcenter.approvals.ApprovalQueueService;
import familycommandcenter.points.PointsService;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class ChoreService {

    private final ChoreRepository choreRepository;
    private final PointsService pointsService;
    private final ApprovalQueueService approvalQueueService;

    public ChoreService(
            ChoreRepository choreRepository,
            PointsService pointsService,
            ApprovalQueueService approvalQueueService) {

        this.choreRepository = choreRepository;
        this.pointsService = pointsService;
        this.approvalQueueService = approvalQueueService;
    }

    public void addChore(
            CreateChoreRequest chore,
            UUID householdId) throws SQLException {

        choreRepository.saveChore(chore, householdId);
    }

    public void addChores(
            List<CreateChoreRequest> chores,
            UUID householdId) throws SQLException {

        for (CreateChoreRequest chore : chores) {
            addChore(chore, householdId);
        }
    }

    public List<ChoreCard> getAllChores(UUID householdId) throws SQLException {
        return choreRepository.findAllChores(householdId);
    }

    public List<ChoreCard> getPendingApprovals(UUID householdId) throws SQLException {
        return choreRepository.findPendingApprovals(householdId);
    }

    public List<ChoreCard> getChoresDueToday(UUID householdId) throws SQLException {
        return choreRepository.findChoresDueToday(householdId);
    }

    public List<ChoreCard> getOverdueChores(UUID householdId) throws SQLException {
        return choreRepository.findOverdueChores(householdId);
    }

    public List<ChoreCard> getChoresForKid(
            String username,
            UUID householdId) throws SQLException {

        return choreRepository.findChoresForKidDashboard(username, householdId);
    }

    public boolean kidSaysChoreIsDone(
            int choreId,
            UUID householdId) throws SQLException {

        Optional<ChoreCard> possibleChore = choreRepository.findById(choreId, householdId);

        if (possibleChore.isEmpty()) {
            return false;
        }

        boolean waitingForParent = choreRepository.requestParentCheck(choreId, householdId);

        if (waitingForParent) {
            approvalQueueService.addChoreApproval(
                    possibleChore.get(),
                    householdId);
        }

        return waitingForParent;
    }

    public boolean parentApprovesChore(
            int choreId,
            UUID householdId) throws SQLException {

        Optional<ChoreCard> possibleChore = choreRepository.findById(choreId, householdId);

        if (possibleChore.isEmpty()) {
            return false;
        }

        ChoreCard chore = possibleChore.get();

        boolean approved = choreRepository.approveChore(choreId, householdId);

        if (approved) {
            pointsService.addPointsForApprovedChore(
                    chore.getAssignedTo(),
                    chore.getPoints(),
                    householdId);

            approvalQueueService.markChoreApprovalApproved(
                    choreId,
                    householdId);
        }

        return approved;
    }

    public boolean parentRejectsChore(
            int choreId,
            UUID householdId) throws SQLException {

        boolean rejected = choreRepository.rejectChore(choreId, householdId);

        if (rejected) {
            approvalQueueService.markChoreApprovalDenied(
                    choreId,
                    householdId);
        }

        return rejected;
    }

    public void deleteChoreForNow(
            int choreId,
            UUID householdId) throws SQLException {

        choreRepository.deleteChoreForNow(choreId, householdId);
    }
}
