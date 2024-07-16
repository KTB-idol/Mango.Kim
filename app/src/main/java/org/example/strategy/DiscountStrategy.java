package org.example.strategy;

import org.example.Item;

public interface DiscountStrategy {
    public abstract Item discount(Item item);
}
