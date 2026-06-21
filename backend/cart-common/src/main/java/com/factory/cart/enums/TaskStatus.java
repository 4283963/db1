package com.factory.cart.enums;

public enum TaskStatus {
    PENDING("待指派"),
    ASSIGNED("已指派"),
    IN_PROGRESS("执行中"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    private final String description;

    TaskStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
