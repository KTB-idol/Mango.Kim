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
