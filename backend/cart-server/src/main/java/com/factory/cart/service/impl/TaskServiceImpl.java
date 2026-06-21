package com.factory.cart.service.impl;

import com.factory.cart.dto.TaskAssignDTO;
import com.factory.cart.dto.TaskCreateDTO;
import com.factory.cart.entity.Cart;
import com.factory.cart.entity.Location;
import com.factory.cart.entity.Task;
import com.factory.cart.enums.CartStatus;
import com.factory.cart.enums.TaskStatus;
import com.factory.cart.enums.TaskType;
import com.factory.cart.repository.CartRepository;
import com.factory.cart.repository.LocationRepository;
import com.factory.cart.repository.TaskRepository;
import com.factory.cart.service.TaskService;
import com.factory.cart.websocket.CartWebSocketHandler;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final CartRepository cartRepository;
    private final LocationRepository locationRepository;
    private final CartWebSocketHandler webSocketHandler;

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("任务不存在，ID: " + id));
    }

    @Override
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> getPendingTasks() {
        return taskRepository.findByStatusInOrderByPriorityDescCreatedAtAsc(
                List.of(TaskStatus.PENDING, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS));
    }

    @Override
    @Transactional
    public Task createTask(TaskCreateDTO dto) {
        Task task = new Task();

        task.setTaskCode(generateTaskCode());
        task.setType(TaskType.valueOf(dto.getType()));
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : 5);
        task.setStatus(TaskStatus.PENDING);

        Location source = locationRepository.findById(dto.getSourceLocationId())
                .orElseThrow(() -> new EntityNotFoundException("起始位置不存在，ID: " + dto.getSourceLocationId()));
        Location target = locationRepository.findById(dto.getTargetLocationId())
                .orElseThrow(() -> new EntityNotFoundException("目标位置不存在，ID: " + dto.getTargetLocationId()));

        task.setSourceLocation(source);
        task.setTargetLocation(target);
        task.setCargoName(dto.getCargoName());
        task.setCargoWeight(dto.getCargoWeight());
        task.setCreator(dto.getCreator());
        task.setRemark(dto.getRemark());

        Task saved = taskRepository.save(task);
        log.info("任务创建成功: {}", saved.getTaskCode());
        return saved;
    }

    @Override
    @Transactional
    public Task assignTask(TaskAssignDTO dto) {
        Task task = getTaskById(dto.getTaskId());
        if (task.getStatus() != TaskStatus.PENDING) {
            throw new IllegalStateException("当前任务状态不允许指派，状态: " + task.getStatus());
        }

        Cart cart = cartRepository.findById(dto.getCartId())
                .orElseThrow(() -> new EntityNotFoundException("小车不存在，ID: " + dto.getCartId()));
        if (cart.getStatus() != CartStatus.IDLE) {
            throw new IllegalStateException("小车当前不处于空闲状态，无法指派任务，状态: " + cart.getStatus());
        }
        if (cart.getMaxLoad().compareTo(task.getCargoWeight()) < 0) {
            throw new IllegalStateException("小车载重不足，任务载重: " + task.getCargoWeight()
                    + "，小车最大载重: " + cart.getMaxLoad());
        }

        task.setCart(cart);
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());

        cart.setStatus(CartStatus.DELIVERING);
        cart.setLastUpdate(LocalDateTime.now());
        cartRepository.save(cart);

        Task saved = taskRepository.save(task);
        log.info("任务 [{}] 已指派给小车 [{}]", saved.getTaskCode(), cart.getCartCode());

        webSocketHandler.broadcastCartUpdate(cart);
        webSocketHandler.broadcastTaskUpdate(saved);

        return saved;
    }

    @Override
    @Transactional
    public Task startTask(Long id) {
        Task task = getTaskById(id);
        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new IllegalStateException("当前任务状态不允许开始，状态: " + task.getStatus());
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setStartedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        log.info("任务 [{}] 开始执行", saved.getTaskCode());

        webSocketHandler.broadcastTaskUpdate(saved);
        return saved;
    }

    @Override
    @Transactional
    public Task completeTask(Long id) {
        Task task = getTaskById(id);
        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new IllegalStateException("当前任务状态不允许完成，状态: " + task.getStatus());
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());

        if (task.getCart() != null) {
            Cart cart = task.getCart();
            cart.setStatus(CartStatus.IDLE);
            cart.setCurrentLoad(java.math.BigDecimal.ZERO);
            cart.setLastUpdate(LocalDateTime.now());
            cartRepository.save(cart);
            webSocketHandler.broadcastCartUpdate(cart);
        }

        Task saved = taskRepository.save(task);
        log.info("任务 [{}] 已完成", saved.getTaskCode());

        webSocketHandler.broadcastTaskUpdate(saved);
        return saved;
    }

    @Override
    @Transactional
    public Task cancelTask(Long id) {
        Task task = getTaskById(id);
        if (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED) {
            throw new IllegalStateException("当前任务状态不允许取消，状态: " + task.getStatus());
        }

        if (task.getCart() != null && task.getStatus() != TaskStatus.COMPLETED) {
            Cart cart = task.getCart();
            if (cart.getStatus() == CartStatus.DELIVERING) {
                cart.setStatus(CartStatus.IDLE);
                cart.setLastUpdate(LocalDateTime.now());
                cartRepository.save(cart);
                webSocketHandler.broadcastCartUpdate(cart);
            }
        }

        task.setStatus(TaskStatus.CANCELLED);
        Task saved = taskRepository.save(task);
        log.info("任务 [{}] 已取消", saved.getTaskCode());

        webSocketHandler.broadcastTaskUpdate(saved);
        return saved;
    }

    private String generateTaskCode() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "TASK-" + dateStr + "-";
        int seq = 1;
        String code = prefix + String.format("%03d", seq);
        while (taskRepository.findByTaskCode(code) != null) {
            seq++;
            code = prefix + String.format("%03d", seq);
        }
        return code;
    }
}
