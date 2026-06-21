-- ============================================================
-- 室内物料小车调度跟踪系统 - 数据库初始化脚本
-- 数据库: PostgreSQL 14+
-- ============================================================

-- 创建数据库 (需要在连接到默认数据库时执行)
-- CREATE DATABASE factory_cart_db WITH ENCODING 'UTF8';

-- 切换到目标数据库后执行以下脚本

-- ============================================================
-- 1. 删除已存在的表 (按依赖顺序)
-- ============================================================
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS location CASCADE;

-- ============================================================
-- 2. 创建位置表 - 存储厂区内的位置节点
-- ============================================================
CREATE TABLE location (
    id          BIGSERIAL       PRIMARY KEY,
    code        VARCHAR(50)     NOT NULL UNIQUE,
    name        VARCHAR(100)    NOT NULL,
    description VARCHAR(255),
    x_coordinate NUMERIC(10, 2) NOT NULL DEFAULT 0,
    y_coordinate NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE location IS '厂区位置节点表';
COMMENT ON COLUMN location.code IS '位置编码';
COMMENT ON COLUMN location.name IS '位置名称';
COMMENT ON COLUMN location.x_coordinate IS 'X坐标';
COMMENT ON COLUMN location.y_coordinate IS 'Y坐标';

-- ============================================================
-- 3. 创建小车表
-- ============================================================
CREATE TABLE cart (
    id              BIGSERIAL       PRIMARY KEY,
    cart_code       VARCHAR(50)     NOT NULL UNIQUE,
    name            VARCHAR(100)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'IDLE',
    current_location_id BIGINT,
    battery_level   INTEGER         NOT NULL DEFAULT 100,
    max_load        NUMERIC(10, 2)  NOT NULL DEFAULT 500,
    current_load    NUMERIC(10, 2)  NOT NULL DEFAULT 0,
    last_update     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remark          VARCHAR(255),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_current_location
        FOREIGN KEY (current_location_id) REFERENCES location(id)
);

COMMENT ON TABLE cart IS '物料小车表';
COMMENT ON COLUMN cart.cart_code IS '小车编号';
COMMENT ON COLUMN cart.status IS '状态: IDLE-空闲, DELIVERING-送货中, FAULT-故障, CHARGING-充电中';
COMMENT ON COLUMN cart.battery_level IS '电量百分比(0-100)';
COMMENT ON COLUMN cart.max_load IS '最大载重(kg)';
COMMENT ON COLUMN cart.current_load IS '当前载重(kg)';

-- 状态索引
CREATE INDEX idx_cart_status ON cart(status);

-- ============================================================
-- 4. 创建任务表
-- ============================================================
CREATE TABLE task (
    id              BIGSERIAL       PRIMARY KEY,
    task_code       VARCHAR(50)     NOT NULL UNIQUE,
    type            VARCHAR(20)     NOT NULL DEFAULT 'DELIVERY',
    priority        INTEGER         NOT NULL DEFAULT 5,
    cart_id         BIGINT,
    source_location_id BIGINT       NOT NULL,
    target_location_id BIGINT       NOT NULL,
    cargo_name      VARCHAR(200)    NOT NULL,
    cargo_weight    NUMERIC(10, 2)  NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    assigned_at     TIMESTAMP,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    creator         VARCHAR(100)    NOT NULL,
    remark          VARCHAR(500),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_cart
        FOREIGN KEY (cart_id) REFERENCES cart(id),
    CONSTRAINT fk_task_source_location
        FOREIGN KEY (source_location_id) REFERENCES location(id),
    CONSTRAINT fk_task_target_location
        FOREIGN KEY (target_location_id) REFERENCES location(id)
);

COMMENT ON TABLE task IS '运输任务表';
COMMENT ON COLUMN task.task_code IS '任务编号';
COMMENT ON COLUMN task.type IS '任务类型: DELIVERY-送货, PICKUP-取货, TRANSFER-调拨';
COMMENT ON COLUMN task.priority IS '优先级(1-10, 数值越大优先级越高)';
COMMENT ON COLUMN task.status IS '状态: PENDING-待指派, ASSIGNED-已指派, IN_PROGRESS-执行中, COMPLETED-已完成, CANCELLED-已取消';

-- 索引
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_task_cart_id ON task(cart_id);
CREATE INDEX idx_task_created_at ON task(created_at);

-- ============================================================
-- 5. 自动更新时间戳的触发器函数
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表绑定触发器
CREATE TRIGGER update_location_updated_at BEFORE UPDATE ON location
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
