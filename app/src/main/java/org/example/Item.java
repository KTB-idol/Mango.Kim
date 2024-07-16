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
