package familycommandcenter.model;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * DAO for the <code>redemptions</code> table.
 * Columns: id, username, reward_id, status, redeemed_at
 */
public final class RedemptionDAO {

    private final DataSource ds;

    public RedemptionDAO(DataSource ds) {
        this.ds = ds;
    }

    /* ──────────────────────────── inserts ──────────────────────────── */

    public void createRedemption(Redemption r) throws SQLException {
        final String sql = """
            INSERT INTO redemptions (username, reward_id, status, redeemed_at)
                 VALUES (?,?,?,?)
        """;
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString   (1, r.getUsername());
            ps.setInt      (2, r.getRewardId());
            ps.setString   (3, r.getStatus());
            ps.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            ps.executeUpdate();
        }
    }

    /* ──────────────────────────── queries ──────────────────────────── */

    public List<Redemption> getAllRedemptions() throws SQLException {
        final String sql = "SELECT * FROM redemptions ORDER BY redeemed_at DESC";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<Redemption> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    public List<Redemption> getRedemptionsForUser(String username) throws SQLException {
        final String sql = """
            SELECT * FROM redemptions
             WHERE username = ?
             ORDER BY redeemed_at DESC
        """;
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                List<Redemption> list = new ArrayList<>();
                while (rs.next()) list.add(map(rs));
                return list;
            }
        }
    }

    /* ──────────────────────────── updates ──────────────────────────── */

    public void updateRedemptionStatus(int id, String status) throws SQLException {
        final String sql = "UPDATE redemptions SET status = ? WHERE id = ?";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt   (2, id);
            ps.executeUpdate();
        }
    }

    /**
     * Approves the pending redemption and deducts points atomically.
     * @return <code>true</code> if approval succeeded.
     */
    public boolean approveRedemption(int redemptionId) throws SQLException {

        /* 1 ─ fetch the redemption (must be pending) */
        final String selectSql = """
            SELECT username, reward_id
              FROM redemptions
             WHERE id = ?
               AND status = 'pending'
             FOR UPDATE
        """;
        try (Connection c = ds.getConnection();
             PreparedStatement select = c.prepareStatement(selectSql)) {

            c.setAutoCommit(false);                     // manual tx

            select.setInt(1, redemptionId);
            try (ResultSet rs = select.executeQuery()) {

                if (!rs.next()) {                       // nothing pending
                    c.rollback();
                    return false;
                }

                String username = rs.getString(1);
                int rewardId    = rs.getInt   (2);

                /* 2 ─ load reward & point balance */
                RewardDAO     rewardDAO = new RewardDAO(ds);
                PointsBankDAO pointsDAO = new PointsBankDAO(ds);

                Optional<Reward> rewardOpt = rewardDAO.getRewardById(rewardId);
                if (rewardOpt.isEmpty()) { c.rollback(); return false; }

                int cost    = rewardOpt.get().getCost();
                int balance = pointsDAO.getPoints(username);

                if (balance < cost) {                   // insufficient funds
                    c.rollback();
                    return false;
                }

                /* 3 ─ deduct points */
                pointsDAO.deductPoints(username, cost);

                /* 4 ─ mark redemption approved */
                final String updateSql = """
                    UPDATE redemptions
                       SET status      = 'approved',
                           redeemed_at = CURRENT_TIMESTAMP
                     WHERE id = ?
                """;
                try (PreparedStatement upd = c.prepareStatement(updateSql)) {
                    upd.setInt(1, redemptionId);
                    upd.executeUpdate();
                }

                c.commit();
                return true;
            } catch (Exception ex) {
                c.rollback();
                throw ex;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    /* ────────────────────────── helper mapper ───────────────────────── */

    private Redemption map(ResultSet rs) throws SQLException {
        Redemption r = new Redemption();
        r.setId        (rs.getInt   ("id"));
        r.setUsername  (rs.getString("username"));
        r.setRewardId  (rs.getInt   ("reward_id"));
        r.setStatus    (rs.getString("status"));
        r.setRedeemedAt(rs.getTimestamp("redeemed_at").toLocalDateTime());
        return r;
    }
}
