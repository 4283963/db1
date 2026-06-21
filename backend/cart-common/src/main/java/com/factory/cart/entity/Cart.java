package com.factory.cart.entity;

import com.factory.cart.enums.CartStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cart_code", nullable = false, unique = true, length = 50)
    private String cartCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CartStatus status = CartStatus.IDLE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_location_id")
    private Location currentLocation;

    @Column(name = "battery_level", nullable = false)
    private Integer batteryLevel = 100;

    @Column(name = "max_load", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxLoad = new BigDecimal("500");

    @Column(name = "current_load", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentLoad = BigDecimal.ZERO;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;

    @Column(name = "remark", length = 255)
    private String remark;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (lastUpdate == null) {
            lastUpdate = LocalDateTime.now();
        }
    }
}
