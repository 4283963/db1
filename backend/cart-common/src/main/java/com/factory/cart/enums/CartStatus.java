package com.factory.cart.enums;

public enum CartStatus {
    IDLE("空闲"),
    DELIVERING("送货中"),
    FAULT("故障"),
    CHARGING("充电中");

    private final String description;

    CartStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
