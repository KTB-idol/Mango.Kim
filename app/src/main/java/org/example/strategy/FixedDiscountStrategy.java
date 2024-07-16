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
