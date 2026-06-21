package com.factory.cart.controller;

import com.factory.cart.common.Result;
import com.factory.cart.dto.CartStatusUpdateDTO;
import com.factory.cart.entity.Cart;
import com.factory.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public Result<List<Cart>> getAllCarts() {
        return Result.success(cartService.getAllCarts());
    }

    @GetMapping("/{id}")
    public Result<Cart> getCartById(@PathVariable Long id) {
        return Result.success(cartService.getCartById(id));
    }

    @GetMapping("/code/{cartCode}")
    public Result<Cart> getCartByCode(@PathVariable String cartCode) {
        return Result.success(cartService.getCartByCode(cartCode));
    }

    @PutMapping("/{id}/status")
    public Result<Cart> updateCartStatus(
            @PathVariable Long id,
            @RequestBody CartStatusUpdateDTO dto) {
        return Result.success(cartService.updateCartStatus(id, dto));
    }
}
