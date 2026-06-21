package com.factory.cart.dto;

import com.factory.cart.enums.CartStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartStatusUpdateDTO {

    private CartStatus status;

    private Long currentLocationId;

    private Integer batteryLevel;

    private BigDecimal currentLoad;

    private String remark;
}
