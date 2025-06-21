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
}
