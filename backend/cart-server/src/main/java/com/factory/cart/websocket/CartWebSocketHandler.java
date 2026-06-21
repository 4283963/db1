package com.factory.cart.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.factory.cart.entity.Cart;
import com.factory.cart.entity.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class CartWebSocketHandler extends TextWebSocketHandler {

    private final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper;

    public CartWebSocketHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        log.info("WebSocket 连接已建立，Session ID: {}，当前连接数: {}", session.getId(), sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        log.info("WebSocket 连接已关闭，Session ID: {}，当前连接数: {}", session.getId(), sessions.size());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.debug("收到客户端消息: {}，Session ID: {}", message.getPayload(), session.getId());
        Map<String, Object> pong = new HashMap<>();
        pong.put("type", "PING_RESPONSE");
        pong.put("timestamp", System.currentTimeMillis());
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(pong)));
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket 传输错误，Session ID: {}", session.getId(), exception);
        sessions.remove(session);
        if (session.isOpen()) {
            session.close();
        }
    }

    public void broadcastCartUpdate(Cart cart) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "CART_UPDATE");
            payload.put("data", cart);
            broadcast(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            log.error("广播小车更新失败，小车ID: {}", cart.getId(), e);
        }
    }

    public void broadcastTaskUpdate(Task task) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "TASK_UPDATE");
            payload.put("data", task);
            broadcast(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            log.error("广播任务更新失败，任务ID: {}", task.getId(), e);
        }
    }

    private void broadcast(String message) {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (Exception e) {
                    log.error("发送WebSocket消息失败，Session ID: {}", session.getId(), e);
                    try {
                        sessions.remove(session);
                        if (session.isOpen()) {
                            session.close();
                        }
                    } catch (Exception ex) {
                        log.error("关闭WebSocket会话失败", ex);
                    }
                }
            }
        }
    }
}
