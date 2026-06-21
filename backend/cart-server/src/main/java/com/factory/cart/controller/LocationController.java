package com.factory.cart.controller;

import com.factory.cart.common.Result;
import com.factory.cart.entity.Location;
import com.factory.cart.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public Result<List<Location>> getAllLocations() {
        return Result.success(locationService.getAllLocations());
    }

    @GetMapping("/{id}")
    public Result<Location> getLocationById(@PathVariable Long id) {
        return Result.success(locationService.getLocationById(id));
    }
}
