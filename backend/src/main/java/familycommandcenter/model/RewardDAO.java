package familycommandcenter.model;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * DAO for the <code>rewards</code> table.<br>
 * Columns: id, name, cost, requires_approval
 */
public final class RewardDAO {

    private final DataSource ds;

    public RewardDAO(DataSource ds) {
        this.ds = ds;
    }

    /* ───────────────────────────── inserts ───────────────────────────── */

    public void addReward(Reward r) throws SQLException {
        final String sql = "INSERT INTO rewards (name, cost, requires_approval) VALUES (?,?,?)";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString (1, r.getName());
            ps.setInt    (2, r.getCost());
            ps.setBoolean(3, r.isRequiresApproval());
            ps.executeUpdate();
        }
    }

    /* ───────────────────────────── queries ───────────────────────────── */

    public Optional<Reward> getRewardById(int id) throws SQLException {
        final String sql = "SELECT * FROM rewards WHERE id = ?";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        }
    }

    public List<Reward> getAllRewards() throws SQLException {
        final String sql = "SELECT * FROM rewards ORDER BY cost ASC";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<Reward> list = new ArrayList<>();
            while (rs.next()) list.add(map(rs));
            return list;
        }
    }

    /**
     * Rewards the kid can currently afford, given their point balance.
     * <p>Relies on <code>points_bank.total_points</code>.</p>
     */
    public List<Reward> getAffordableRewards(String username, int currentPoints) throws SQLException {
        final String sql = """
            SELECT * FROM rewards
             WHERE cost <= ?
             ORDER BY cost ASC
        """;
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setInt(1, currentPoints);
            try (ResultSet rs = ps.executeQuery()) {
                List<Reward> list = new ArrayList<>();
                while (rs.next()) list.add(map(rs));
                return list;
            }
        }
    }

    /* ────────────────────────── helper mapper ────────────────────────── */

    private Reward map(ResultSet rs) throws SQLException {
        Reward r = new Reward();
        r.setId               (rs.getInt   ("id"));
        r.setName             (rs.getString("name"));
        r.setCost             (rs.getInt   ("cost"));
        r.setRequiresApproval (rs.getBoolean("requires_approval"));
        return r;
    }
}
