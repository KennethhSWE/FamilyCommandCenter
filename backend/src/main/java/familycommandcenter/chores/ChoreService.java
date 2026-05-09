package familycommandcenter.chores;

import familycommandcenter.points.PointsService;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class ChoreService {

    private final ChoreRepository choreRepository;
    private final PointsService pointsService;

    public ChoreService(ChoreRepository choreRepository, PointsService pointsService) {
        this.choreRepository = choreRepository;
        this.pointsService = pointsService;
    }

    public void addChore(CreateChoreRequest chore) throws SQLException {
        choreRepository.saveChore(chore);
    }

    public void addChores(List<CreateChoreRequest> chores) throws SQLException {
        for (CreateChoreRequest chore : chores) {
            addChore(chore);
        }
    }

    public List<ChoreCard> getAllChores() throws SQLException {
        return choreRepository.findAllChores();
    }

    public List<ChoreCard> getPendingApprovals() throws SQLException {
        return choreRepository.findPendingApprovals();
    }

    public List<ChoreCard> getChoresDueToday() throws SQLException {
        return choreRepository.findChoresDueToday();
    }

    public List<ChoreCard> getOverdueChores() throws SQLException {
        return choreRepository.findOverdueChores();
    }

    public List<ChoreCard> getChoresForKid(String username) throws SQLException {
        return choreRepository.findIncompleteChoresForKid(username);
    }

    public boolean kidSaysChoreIsDone(int choreId) throws SQLException {
        return choreRepository.requestParentCheck(choreId);
    }

    public boolean parentApprovesChore(int choreId) throws SQLException {
        Optional<ChoreCard> possibleChore = choreRepository.findById(choreId);

        if (possibleChore.isEmpty()) {
            return false;
        }

        ChoreCard chore = possibleChore.get();
        boolean approved = choreRepository.approveChore(choreId);

        if (approved) {
            pointsService.addPointsForApprovedChore(chore.getAssignedTo(), chore.getPoints());
        }

        return approved;
    }

    public boolean parentRejectsChore(int choreId) throws SQLException {
        return choreRepository.rejectChore(choreId);
    }

    public void deleteChoreForNow(int choreId) throws SQLException {
        choreRepository.deleteChoreForNow(choreId);
    }
}