-- ============================================================
-- 室内物料小车调度跟踪系统 - 初始化数据脚本
-- ============================================================

-- ============================================================
-- 1. 初始化位置数据 (模拟厂区主要节点)
-- ============================================================
INSERT INTO location (code, name, description, x_coordinate, y_coordinate) VALUES
('WAREHOUSE_A', 'A区仓库', '原材料仓库A区', 10.00, 20.00),
('WAREHOUSE_B', 'B区仓库', '成品仓库B区', 80.00, 20.00),
('WORKSHOP_1', '一号车间', '机械加工车间', 10.00, 60.00),
('WORKSHOP_2', '二号车间', '装配车间', 45.00, 60.00),
('WORKSHOP_3', '三号车间', '焊接车间', 80.00, 60.00),
('QUALITY_CENTER', '质检中心', '质量检测中心', 45.00, 20.00),
('CHARGING_STATION', '充电站', '小车充电区', 45.00, 90.00),
('MAINTENANCE', '维修站', '设备维修区', 10.00, 90.00),
('LOADING_DOCK', '装卸区', '货物装卸站台', 80.00, 90.00),
('OFFICE_AREA', '办公区', '行政办公区域', 45.00, 40.00);

-- ============================================================
-- 2. 初始化小车数据
-- ============================================================
INSERT INTO cart (cart_code, name, status, current_location_id, battery_level, max_load, current_load, remark) VALUES
('CART-001', '阿尔法1号', 'IDLE',
    (SELECT id FROM location WHERE code = 'CHARGING_STATION'),
    100, 500.00, 0.00, '主力运输车辆'),
('CART-002', '阿尔法2号', 'DELIVERING',
    (SELECT id FROM location WHERE code = 'WORKSHOP_1'),
    85, 500.00, 200.00, '主力运输车辆'),
('CART-003', '贝塔1号', 'IDLE',
    (SELECT id FROM location WHERE code = 'WAREHOUSE_A'),
    95, 800.00, 0.00, '重型运输车辆'),
('CART-004', '贝塔2号', 'FAULT',
    (SELECT id FROM location WHERE code = 'MAINTENANCE'),
    45, 800.00, 0.00, '电机故障，待维修'),
('CART-005', '伽马1号', 'CHARGING',
    (SELECT id FROM location WHERE code = 'CHARGING_STATION'),
    30, 300.00, 0.00, '轻型运输车辆'),
('CART-006', '伽马2号', 'IDLE',
    (SELECT id FROM location WHERE code = 'QUALITY_CENTER'),
    88, 300.00, 0.00, '轻型运输车辆');

-- ============================================================
-- 3. 初始化任务数据 (一些示例任务)
-- ============================================================
INSERT INTO task (task_code, type, priority, cart_id, source_location_id, target_location_id,
    cargo_name, cargo_weight, status, assigned_at, started_at, completed_at, creator, remark) VALUES
('TASK-20260621-001', 'DELIVERY', 8,
    (SELECT id FROM cart WHERE cart_code = 'CART-002'),
    (SELECT id FROM location WHERE code = 'WAREHOUSE_A'),
    (SELECT id FROM location WHERE code = 'WORKSHOP_1'),
    '钢材原材料', 200.00, 'IN_PROGRESS',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes',
    CURRENT_TIMESTAMP - INTERVAL '10 minutes',
    NULL, '调度员张工', '紧急物料'),

('TASK-20260621-002', 'DELIVERY', 5,
    NULL,
    (SELECT id FROM location WHERE code = 'WAREHOUSE_B'),
    (SELECT id FROM location WHERE code = 'LOADING_DOCK'),
    '成品A批次-50件', 350.00, 'PENDING',
    NULL, NULL, NULL, '调度员李工', '等待发货'),

('TASK-20260621-003', 'PICKUP', 6,
    NULL,
    (SELECT id FROM location WHERE code = 'WORKSHOP_2'),
    (SELECT id FROM location WHERE code = 'QUALITY_CENTER'),
    '半成品待检测', 150.00, 'PENDING',
    NULL, NULL, NULL, '调度员王工', '等待检验'),

('TASK-20260621-004', 'TRANSFER', 3,
    NULL,
    (SELECT id FROM location WHERE code = 'WAREHOUSE_A'),
    (SELECT id FROM location WHERE code = 'WAREHOUSE_B'),
    '库存调拨-包装材料', 100.00, 'PENDING',
    NULL, NULL, NULL, '仓储管理员', NULL),

('TASK-20260620-099', 'DELIVERY', 7,
    (SELECT id FROM cart WHERE cart_code = 'CART-001'),
    (SELECT id FROM location WHERE code = 'WORKSHOP_3'),
    (SELECT id FROM location WHERE code = 'WAREHOUSE_B'),
    '完工产品-C12型号', 280.00, 'COMPLETED',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    '调度员张工', '已完成入库');
