package familycommandcenter.model;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RewardDAO {
    private final Connection conn;

    public RewardDAO(Connection conn) {
        this.conn = conn;
    }

    public void addReward(Reward reward) throws SQLException {
        String sql = "INSERT INTO rewards (name, cost, requires_approval) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, reward.getName());
            stmt.setInt(2, reward.getCost());
            stmt.setBoolean(3, reward.isRequiresApproval());
            stmt.executeUpdate();
        }
    }

    // Method to update an existing reward
    public List<Reward> getAllRewards() throws SQLException {
        List<Reward> rewards = new ArrayList<>();
        String sql = "SELECT * FROM rewards";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Reward reward = new Reward();
                reward.setId(rs.getInt("id"));
                reward.setName(rs.getString("name"));
                reward.setCost(rs.getInt("cost"));
                reward.setRequiresApproval(rs.getBoolean("requires_approval"));
                rewards.add(reward);
            }
        }
        return rewards;
    }

    // Method to update an existing reward
    public Optional<Reward> getRewardById(int id) {
        String sql = "SELECT * FROM rewards WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Reward reward = new Reward();
                reward.setId(rs.getInt("id"));
                reward.setName(rs.getString("name"));
                reward.setCost(rs.getInt("cost"));
                reward.setRequiresApproval(rs.getBoolean("requires_approval"));
                return Optional.of(reward);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    // Method to create a redemption for a reward
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

    // Method to get all available rewards for a user based on their points
    public List<Reward> getAvailableRewardsForUser(String username) throws SQLException {
        List<Reward> rewards = new ArrayList<>();

        String sql = """
                SELECT r.*
                FROM rewards r
                JOIN points_bank p ON p.username = ?
                WHERE r.cost <= p.points
        """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Reward reward = new Reward();
                reward.setId(rs.getInt("id"));
                reward.setName(rs.getString("name"));
                reward.setCost(rs.getInt("cost"));
                reward.setRequiresApproval(rs.getBoolean("auto_approve"));
                rewards.add(reward);
            }
        }
        return rewards;
    }
}
