package com.factory.cart.service;

import com.factory.cart.entity.Location;

import java.util.List;

public interface LocationService {

    List<Location> getAllLocations();

    Location getLocationById(Long id);
}
