package com.factory.cart.repository;

import com.factory.cart.entity.Task;
import com.factory.cart.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Task findByTaskCode(String taskCode);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByCartId(Long cartId);

    @Query("SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countByStatus();

    List<Task> findByStatusInOrderByPriorityDescCreatedAtAsc(List<TaskStatus> statuses);
}
