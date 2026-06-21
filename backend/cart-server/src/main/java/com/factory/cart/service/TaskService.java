package com.factory.cart.service;

import com.factory.cart.dto.TaskAssignDTO;
import com.factory.cart.dto.TaskCreateDTO;
import com.factory.cart.entity.Task;
import com.factory.cart.enums.TaskStatus;

import java.util.List;

public interface TaskService {

    List<Task> getAllTasks();

    Task getTaskById(Long id);

    List<Task> getTasksByStatus(TaskStatus status);

    List<Task> getPendingTasks();

    Task createTask(TaskCreateDTO dto);

    Task assignTask(TaskAssignDTO dto);

    Task startTask(Long id);

    Task completeTask(Long id);

    Task cancelTask(Long id);
}
