package com.factory.cart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskAssignDTO {

    @NotNull(message = "任务ID不能为空")
    private Long taskId;

    @NotNull(message = "小车ID不能为空")
    private Long cartId;
}
