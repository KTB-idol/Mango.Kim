package org.example;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.example.db.MysqlConnection;

public class ItemManager {

    private static int connectionCallCount = 0;

    public static void save(Item item) {
        MysqlConnection dbInstance = MysqlConnection.getInstance();
        Connection connection = dbInstance.getConnection();
        printConnectionInstance(dbInstance);

        try (PreparedStatement stmt = connection.prepareStatement("INSERT INTO items (name, price) VALUES (?, ?)")) {

            stmt.setString(1, item.getItemName());
            stmt.setInt(2, item.getPrice());
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static Item findItemByItemName(String itemName) {
        MysqlConnection dbInstance = MysqlConnection.getInstance();
        Connection connection = dbInstance.getConnection();
        printConnectionInstance(dbInstance);

        try (PreparedStatement stmt = connection
                .prepareStatement("SELECT id, name, price FROM items WHERE name = ?")) {

            stmt.setString(1, itemName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int id = rs.getInt("id");
                    String name = rs.getString("name");
                    int price = rs.getInt("price");
                    return new Item(name, price);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }

    private static void printConnectionInstance(MysqlConnection dbInstance) {
        System.out.println("Get Instace(" + connectionCallCount + ") : " + dbInstance);
        connectionCallCount++;
    }
}
