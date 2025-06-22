package familycommandcenter.model;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RedemptionDAO {
    private final Connection conn;

    public RedemptionDAO(Connection conn) {
        this.conn = conn;
    }

    public void createRedemption(Redemption redemption) throws SQLException {
        String sql = "INSERT INTO redemptions (username, reward_id, status, redeemed_at) VALUES (?, ?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, redemption.getUsername());
            stmt.setInt(2, redemption.getRewardId());
            stmt.setString(3, redemption.getStatus());
            stmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            stmt.executeUpdate();
        }
    }

    public List<Redemption> getAllRedemptions() throws SQLException {
        List<Redemption> list = new ArrayList<>();
        String sql = "SELECT * FROM redemptions ORDER BY redeemed_at DESC";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Redemption r = new Redemption();
                r.setId(rs.getInt("id"));
                r.setUsername(rs.getString("username"));
                r.setRewardId(rs.getInt("reward_id"));
                r.setStatus(rs.getString("status"));
                r.setRedeemedAt(rs.getTimestamp("redeemed_at").toLocalDateTime());
                list.add(r);
            }
        }
        return list;
    }

    public void updateRedemptionStatus(int id, String status) throws SQLException {
        String sql = "UPDATE redemptions SET status = ? WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, id);
            stmt.executeUpdate();
        }
    }

    public List<Redemption> getRedemptionsForUser(String username) throws SQLException {
        List<Redemption> redemptions = new ArrayList<>();
        String sql = "SELECT * FROM redemptions WHERE username = ? ORDER BY redeemed_at DESC";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
        ResultSet rs = stmt.executeQuery();
        while (rs.next()) {
            Redemption r = new Redemption();
            r.setId(rs.getInt("id"));
            r.setUsername(rs.getString("username"));
            r.setRewardId(rs.getInt("reward_id"));
            r.setStatus(rs.getString("status"));
            r.setRedeemedAt(rs.getTimestamp("redeemed_at").toLocalDateTime());
            redemptions.add(r);
        }
    }
    return redemptions;
    }

    public boolean approveRedemption(int redemptionId) throws SQLException {
        //1. Retrieve the pending redemption
        String selectSql = "SELECT * FROM redemptions WHERE id = ? AND status = 'pending'";
        try  (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
            stmt.setInt(1, redemptionId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return false; // Redemption not found or not pending
                }
            String username = rs.getString("username");
            int rewardId = rs.getInt("reward_id");

            //2. Get reward cost
            Reward reward = new RewardDAO(conn).getRewardById(rewardId).orElse(null);
            if (reward == null) return false; // Reward not found

            //3. Check and deduct points
            PointsBankDAO pointsDao = new PointsBankDAO(conn);
            int balance = pointsDao.getPoints(username);
            if (balance < reward.getCost()) return false; // Not enough points

            pointsDao.deductPoints(username, reward.getCost());

            //4. Update redemption status 
            String updateSql = "UPDATE redemptions SET status = 'approved', redeemed_at = CURRENT_TIMESTAMP WHERE id = ?";
            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setInt(1, redemptionId);
                updateStmt.executeUpdate();
            }

            return true; // Redemption approved successfully
            }
        }
    }
}
