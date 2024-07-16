package org.example.db;

import io.github.cdimascio.dotenv.Dotenv;

public class MysqlDBConfig {

    private static final Dotenv dotenv = Dotenv.load();
    public static final String URL = "jdbc:mysql://localhost:3306/singletontest";
    public static final String USER = dotenv.get("DB_USER");
    public static final String PASSWORD = dotenv.get("DB_PASSWORD");

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
