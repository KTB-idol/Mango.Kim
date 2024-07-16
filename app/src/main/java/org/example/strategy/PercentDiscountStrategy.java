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
