package familycommandcenter.chores;

import familycommandcenter.model.User;
import familycommandcenter.model.UserDAO;
import familycommandcenter.points.PointsService;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class DailyChoreService {

    private static final int MAX_CHORES_PER_KID = 5;

    private final UserDAO userDAO;
    private final ChoreRepository choreRepository;
    private final PointsService pointsService;

    public DailyChoreService(
            UserDAO userDAO,
            ChoreRepository choreRepository,
            PointsService pointsService) {

        this.userDAO = userDAO;
        this.choreRepository = choreRepository;
        this.pointsService = pointsService;
    }

    public DailyChoreSummary runMorningChoreSweep(UUID householdId)
            throws SQLException {

        LocalDate today = LocalDate.now();

        int kidsChecked = 0;
        int carriedOverChores = 0;
        int penaltyPointsTaken = 0;
        int newChoresAssigned = 0;

        List<User> kids = userDAO.getKidsByHousehold(householdId);

        for (User kid : kids) {
            kidsChecked++;

            int missedChores = choreRepository.moveMissedChoresToToday(
                    kid.getUsername(),
                    today,
                    householdId);

            carriedOverChores += missedChores;

            for (int i = 0; i < missedChores; i++) {
                penaltyPointsTaken += pointsService.takePointForMissedChore(
                        kid.getUsername(),
                        householdId);
            }

            int openChoresToday = choreRepository.countOpenChoresForKidOnDate(
                    kid.getUsername(),
                    today,
                    householdId);

            int choreSlotsToFill = Math.max(0, MAX_CHORES_PER_KID - openChoresToday);

            if (choreSlotsToFill == 0) {
                continue;
            }

            List<ChoreCard> chorePool = choreRepository.findPoolChoresForKidAge(
                    kid.getAge(),
                    householdId);

            Collections.shuffle(chorePool);

            int addedForThisKid = 0;

            for (ChoreCard poolChore : chorePool) {
                if (addedForThisKid == choreSlotsToFill) {
                    break;
                }

                boolean alreadyHasThisChore = choreRepository.isAlreadyAssignedToday(
                        kid.getUsername(),
                        poolChore.getName(),
                        householdId);

                if (alreadyHasThisChore) {
                    continue;
                }

                choreRepository.assignPoolChoreToKid(
                        poolChore,
                        kid.getUsername(),
                        today,
                        householdId);

                addedForThisKid++;
                newChoresAssigned++;
            }
        }

        return new DailyChoreSummary(
                kidsChecked,
                carriedOverChores,
                penaltyPointsTaken,
                newChoresAssigned);
    }
}