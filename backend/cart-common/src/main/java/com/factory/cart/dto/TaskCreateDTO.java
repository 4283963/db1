package com.factory.cart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaskCreateDTO {

    @NotBlank(message = "任务类型不能为空")
    private String type;

    @NotNull(message = "优先级不能为空")
    private Integer priority = 5;

    @NotNull(message = "起始位置不能为空")
    private Long sourceLocationId;

    @NotNull(message = "目标位置不能为空")
    private Long targetLocationId;

    @NotBlank(message = "货物名称不能为空")
    @Size(max = 200, message = "货物名称长度不能超过200字符")
    private String cargoName;

    private BigDecimal cargoWeight = BigDecimal.ZERO;

    @NotBlank(message = "创建人不能为空")
    @Size(max = 100, message = "创建人长度不能超过100字符")
    private String creator;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remark;
}
