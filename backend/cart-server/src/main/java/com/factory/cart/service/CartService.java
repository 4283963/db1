package com.factory.cart.service;

import com.factory.cart.entity.Cart;
import com.factory.cart.dto.CartStatusUpdateDTO;

import java.util.List;

public interface CartService {

    List<Cart> getAllCarts();

    Cart getCartById(Long id);

    Cart getCartByCode(String cartCode);

    Cart updateCartStatus(Long id, CartStatusUpdateDTO dto);
}
