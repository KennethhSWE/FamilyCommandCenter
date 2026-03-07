package familycommandcenter.model;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
     * Approves the pending redemption and deducts points in the same transaction/ 
     * @return <code>true</code> if approval succeeded.
     */
    public boolean approveRedemption(int redemptionId) throws SQLException {
        final String selectRedemptionSql = """
                SELECT username, reward_id
                FROM redemptions
                WHERE id = ?
                AND status = 'pending'
                FOR UPDATE
                """;
        final String selectRewardSql = """
                SELECT cost 
                FROM rewards
                WHERE id = ?
                """;
        final String selectPointsSql = """
                SELECT total_points
                FROM points_bank
                WHERE user_name = ?
                FOR UPDATE
                """;
        final String deductPointsSql = """
                UPDATE points_bank
                SET total_points = total_points - ?
                WHERE user_name = ?
                """;
        final String updateRedemptionSql = """
                UPDATE redemptions
                SET status = 'approved',
                redeemed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """;

        try (Connection c = ds.getConnection()) {
            c.setAutoCommit(false);

            try {
                String username; 
                int rewardId;

                try (PreparedStatement ps = c.prepareStatement(selectRedemptionSql)) {
                    ps.setInt(1, redemptionId);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            c.rollback();
                            return false;
                        }

                        username = rs.getString("username");
                        rewardId = rs.getInt("reward_id");
                    }
                }

                int cost; 
                try (PreparedStatement ps = c.prepareStatement(selectRewardSql)) {
                    ps.setInt(1, rewardId);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            c.rollback();
                            return false;
                        }

                        cost = rs.getInt("cost");
                    }
                }

                int balance; 
                try (PreparedStatement ps = c.prepareStatement(selectPointsSql)) {
                    ps.setString(1, username);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            c.rollback();
                            return false;
                        }
                        
                        balance = rs.getInt("total_points");
                    }
                }

                if (balance < cost) {
                    c.rollback();
                    return false;
                }

                try (PreparedStatement ps = c.prepareStatement(deductPointsSql)) {
                    ps.setInt(1, cost);
                    ps.setString(2, username);
                    ps.executeUpdate();
                }

                try (PreparedStatement ps = c.prepareStatement(updateRedemptionSql)) {
                    ps.setInt(1, redemptionId);
                    ps.executeUpdate();
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
