# 싱글톤, 전략 패턴 실습

![그그극.webp](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b6f698e-8a67-4ad1-94b0-53ee956264c9/7749fe26-3a1f-472c-9331-f18dbf9a0145/%E1%84%80%E1%85%B3%E1%84%80%E1%85%B3%E1%84%80%E1%85%B3%E1%86%A8.webp)
과제 소개지만 보안상 이유로 업로드 X

## JDBC 의존성 추가

- 현재 사용중 mysql 버전

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b6f698e-8a67-4ad1-94b0-53ee956264c9/78ec9577-1268-4ea2-a8fb-2db15d82c643/Untitled.png) 1111111

- JDBC 버전 선택
    
    ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b6f698e-8a67-4ad1-94b0-53ee956264c9/1a443bb8-cf73-41c0-b618-ba8d08956708/Untitled.png) 2222222222
    
- Gradle에 추가

![스크린샷 2024-07-16 오후 1.46.31.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b6f698e-8a67-4ad1-94b0-53ee956264c9/6864b1fe-e8ad-4e2e-b704-5f92899541e8/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-07-16_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_1.46.31.png) 33333333

- 데이터를 객체로 관리할 Item 클래스 작성

```jsx
package org.example;

public class Item {

    private String itemName;
    private Integer price;

    public Item(String itemName, Integer price) {
        this.itemName = itemName;
        this.price = price;
    }

    public String getItemName() {
        return itemName;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String toString() {
        return "Item{" +
                "itemName='" + itemName + '\'' +
                ", price=" + price +
                '}';
    }
}

```

## 커넥션 싱글톤 클래스 구현

- DB 스키마 생성

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b6f698e-8a67-4ad1-94b0-53ee956264c9/72c652ef-b189-4b8c-89c7-a2880f8e31cb/Untitled.png) 444444444

- Config 클래스 작성

```jsx
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

```

- 싱글톤 클래스 작성

```jsx
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
            createTablesIfNotExist();
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

    private void createTablesIfNotExist() {
        String createUsersTable = "CREATE TABLE IF NOT EXISTS items ("
                + "id INT AUTO_INCREMENT PRIMARY KEY, "
                + "name VARCHAR(100) NOT NULL UNIQUE, "
                + "price INT NOT NULL, "
                + "percent_discount DECIMAL(5, 2) DEFAULT 0, "
                + "fixed_discount INT DEFAULT 0, "
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ")";

        try (Statement stmt = connection.createStatement()) {
            stmt.execute(createUsersTable);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to create table");
        }
    }
}

```

- 전략 패턴 클래스 작성

```jsx
package org.example.strategy;

import org.example.Item;

public interface DiscountStrategy {
    public abstract Item discount(Item item);
}

```

```jsx
package org.example.strategy;

import org.example.Item;

public class FixedDiscountStrategy implements DiscountStrategy {

    private Integer amount;

    public FixedDiscountStrategy(Integer discountAmount) {
        this.amount = discountAmount;
    }

    @Override
    public Item discount(Item item) {
        System.out.println("Item \"" + item.getItemName() + "\" is discounted by " + amount + " units.");
        System.out.println("Result : " + (item.getPrice() - amount));
        item.setPrice((item.getPrice() - amount));
        return item;
    }
}

```

```jsx
package org.example.strategy;

import org.example.Item;

public class PercentDiscountStrategy implements DiscountStrategy {
    private Double percent;

    public PercentDiscountStrategy(Double discountPercent) {
        this.percent = discountPercent;
    }

    @Override
    public Item discount(Item item) {
        System.out.println("Item \"" + item.getItemName() + "\" is discounted by " + percent * 100 + "%.");
        int result = (int) (item.getPrice() * (1 - percent));
        System.out.println("Result : " + result);
        item.setPrice(result);
        return item;
    }
}

```

```jsx
package org.example.strategy;

import org.example.Item;

public class DiscountContext {
    private DiscountStrategy discountStrategy;

    public void setDiscountStrategy(DiscountStrategy discountStrategy) {
        this.discountStrategy = discountStrategy;
    }

    public Item executeDiscount(Item item) {
        return discountStrategy.discount(item);
    }
}

```