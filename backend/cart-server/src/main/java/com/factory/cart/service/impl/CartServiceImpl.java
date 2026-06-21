package com.factory.cart.service.impl;

import com.factory.cart.dto.CartStatusUpdateDTO;
import com.factory.cart.entity.Cart;
import com.factory.cart.entity.Location;
import com.factory.cart.enums.CartStatus;
import com.factory.cart.repository.CartRepository;
import com.factory.cart.repository.LocationRepository;
import com.factory.cart.service.CartService;
import com.factory.cart.websocket.CartWebSocketHandler;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final LocationRepository locationRepository;
    private final CartWebSocketHandler webSocketHandler;

    @Override
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    @Override
    public Cart getCartById(Long id) {
        return cartRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("小车不存在，ID: " + id));
    }

    @Override
    public Cart getCartByCode(String cartCode) {
        Cart cart = cartRepository.findByCartCode(cartCode);
        if (cart == null) {
            throw new EntityNotFoundException("小车不存在，编号: " + cartCode);
        }
        return cart;
    }

    @Override
    @Transactional
    public Cart updateCartStatus(Long id, CartStatusUpdateDTO dto) {
        Cart cart = getCartById(id);

        boolean changed = false;

        if (dto.getStatus() != null && !dto.getStatus().equals(cart.getStatus())) {
            CartStatus oldStatus = cart.getStatus();
            cart.setStatus(dto.getStatus());
            changed = true;
            log.info("小车 [{}] 状态变更: {} -> {}",
                    cart.getCartCode(), oldStatus, dto.getStatus());
        }

        if (dto.getCurrentLocationId() != null) {
            Location location = locationRepository.findById(dto.getCurrentLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("位置不存在，ID: " + dto.getCurrentLocationId()));
            if (!location.getId().equals(
                    cart.getCurrentLocation() == null ? null : cart.getCurrentLocation().getId())) {
                cart.setCurrentLocation(location);
                changed = true;
                log.info("小车 [{}] 位置变更 -> {}", cart.getCartCode(), location.getName());
            }
        }

        if (dto.getBatteryLevel() != null && dto.getBatteryLevel() >= 0 && dto.getBatteryLevel() <= 100) {
            if (!dto.getBatteryLevel().equals(cart.getBatteryLevel())) {
                cart.setBatteryLevel(dto.getBatteryLevel());
                changed = true;
            }
        }

        if (dto.getCurrentLoad() != null && dto.getCurrentLoad().compareTo(BigDecimal.ZERO) >= 0) {
            if (dto.getCurrentLoad().compareTo(cart.getCurrentLoad()) != 0) {
                cart.setCurrentLoad(dto.getCurrentLoad());
                changed = true;
            }
        }

        if (dto.getRemark() != null && !dto.getRemark().equals(cart.getRemark())) {
            cart.setRemark(dto.getRemark());
            changed = true;
        }

        if (changed) {
            cart.setLastUpdate(LocalDateTime.now());
            Cart saved = cartRepository.save(cart);
            webSocketHandler.broadcastCartUpdate(saved);
            return saved;
        }

        return cart;
    }
}
