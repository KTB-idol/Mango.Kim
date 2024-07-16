package org.example.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class MysqlConnection {
    private static MysqlConnection instance;
    private Connection connection;

    private MysqlConnection() {
        try {
            this.connection = DriverManager.getConnection(MysqlDBConfig.URL, MysqlDBConfig.USER, MysqlDBConfig.PASSWORD);
            createTablesExist();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to connect to DB");
        }
    }

    public static MysqlConnection getInstance() {
        if (instance == null) {
            synchronized (MysqlDBConfig.class) {
                if (instance == null) {
                    instance = new MysqlConnection();
                }
            }
        }
        return instance;
    }

    public Connection getConnection() {
        return connection;
    }

    private void createTablesExist() {
        String dropItemsTable = "DROP TABLE IF EXISTS items";
        String createItemsTable = "CREATE TABLE IF NOT EXISTS items ("
            + "id INT AUTO_INCREMENT PRIMARY KEY, "
            + "name VARCHAR(100) NOT NULL UNIQUE, "
            + "price INT NOT NULL, "
            + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            + ")";

        try (Statement stmt = connection.createStatement()) {
            stmt.execute(dropItemsTable);
            stmt.execute(createItemsTable);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to create table");
        }
    }
}
