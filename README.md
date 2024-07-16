# 싱글톤, 전략 패턴 실습

* DB 커넥션 싱글톤 패턴으로 작성
* 전략 패턴으로 상품 할인 구현

## JDBC 의존성 추가

- 현재 사용중 mysql 버전
<img width="481" alt="1" src="https://github.com/user-attachments/assets/338b9e24-20da-4941-824f-fedc3ba17534">

- JDBC 버전 선택
    <img width="855" alt="22222222" src="https://github.com/user-attachments/assets/fe9d5f80-de15-442a-8723-b34516b4e0cf">


    
- Gradle에 추가
<img width="667" alt="33333333" src="https://github.com/user-attachments/assets/71e09086-466f-4c4a-b456-e9ada6147781">

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

<img width="424" alt="444444" src="https://github.com/user-attachments/assets/08ecefcb-3ace-49cf-a068-83c32a51b7a1">


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

## 결과

```jsx
/*
 * This source file was generated by the Gradle 'init' task
 */
package org.example;

import org.example.strategy.DiscountContext;
import org.example.strategy.DiscountStrategy;
import org.example.strategy.FixedDiscountStrategy;
import org.example.strategy.PercentDiscountStrategy;

public class App {

    public static void main(String[] args) {
        System.out.println("\n");
        Item item = new Item("sample", 100);
        ItemManager.save(item);
        System.out.println("Item insert successfully");

        System.out.println("\ntrying to get Item(sample)");
        item = ItemManager.findItemByItemName("sample");
        System.out.println(item.toString());

        DiscountContext discountContext = new DiscountContext();

        System.out.println("<--- Percent discount by 10%. --->");
        DiscountStrategy percentDiscountStrategy = new PercentDiscountStrategy(0.1);
        discountContext.setDiscountStrategy(percentDiscountStrategy);
        System.out.print(item.getPrice() + " -> ");
        item = discountContext.executeDiscount(item);
        System.out.println(item.getPrice());
        System.out.println(item.toString());

        System.out.println("\n<--- Fixed discount by 25 units. --->");
        DiscountStrategy fixedDiscount = new FixedDiscountStrategy(25);
        discountContext.setDiscountStrategy(fixedDiscount);
        System.out.print(item.getPrice() + " -> ");
        item = discountContext.executeDiscount(item);
        System.out.println(item.getPrice());
        System.out.println(item.toString());
    }
}

```

```jsx
Get Instace(0) : org.example.db.MysqlConnection@3571b748
Item insert successfully

trying to get Item(sample)
Get Instace(1) : org.example.db.MysqlConnection@3571b748
Item{itemName='sample', price=100}
<--- Percent discount by 10%. --->
100 -> Item "sample" is discounted by 10.0%.
Result : 90
90
Item{itemName='sample', price=90}

<--- Fixed discount by 25 units. --->
90 -> Item "sample" is discounted by 25 units.
Result : 65
65
Item{itemName='sample', price=65}
```

커넥션 인스턴스의 주소값이 같으므로 동일한 하나의 인스턴스를 사용하는 싱글톤 객체이다.

복합 할인에 경우 두 할인을 순차적으로 적용한다.
