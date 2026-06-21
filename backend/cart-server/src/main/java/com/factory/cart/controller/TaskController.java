package com.factory.cart.controller;

import com.factory.cart.common.Result;
import com.factory.cart.dto.TaskAssignDTO;
import com.factory.cart.dto.TaskCreateDTO;
import com.factory.cart.entity.Task;
import com.factory.cart.enums.TaskStatus;
import com.factory.cart.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public Result<List<Task>> getAllTasks() {
        return Result.success(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public Result<Task> getTaskById(@PathVariable Long id) {
        return Result.success(taskService.getTaskById(id));
    }

    @GetMapping("/status/{status}")
    public Result<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        return Result.success(taskService.getTasksByStatus(status));
    }

    @GetMapping("/pending")
    public Result<List<Task>> getPendingTasks() {
        return Result.success(taskService.getPendingTasks());
    }

    @PostMapping
    public Result<Task> createTask(@Valid @RequestBody TaskCreateDTO dto) {
        return Result.success(taskService.createTask(dto));
    }

    @PostMapping("/assign")
    public Result<Task> assignTask(@Valid @RequestBody TaskAssignDTO dto) {
        return Result.success(taskService.assignTask(dto));
    }

    @PutMapping("/{id}/start")
    public Result<Task> startTask(@PathVariable Long id) {
        return Result.success(taskService.startTask(id));
    }

    @PutMapping("/{id}/complete")
    public Result<Task> completeTask(@PathVariable Long id) {
        return Result.success(taskService.completeTask(id));
    }

    @PutMapping("/{id}/cancel")
    public Result<Task> cancelTask(@PathVariable Long id) {
        return Result.success(taskService.cancelTask(id));
    }
}
