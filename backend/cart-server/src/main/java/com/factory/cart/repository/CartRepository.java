package com.factory.cart.repository;

import com.factory.cart.entity.Cart;
import com.factory.cart.enums.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Cart findByCartCode(String cartCode);

    List<Cart> findByStatus(CartStatus status);

    @Query("SELECT c.status, COUNT(c) FROM Cart c GROUP BY c.status")
    List<Object[]> countByStatus();
}
