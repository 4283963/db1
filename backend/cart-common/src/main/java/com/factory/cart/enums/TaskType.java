package com.factory.cart.enums;

public enum TaskType {
    DELIVERY("送货"),
    PICKUP("取货"),
    TRANSFER("调拨");

    private final String description;

    TaskType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
