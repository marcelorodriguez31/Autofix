package com.example.signin.controller;

import com.example.signin.dto.HistorialMantencionDTO;
import com.example.signin.service.HistorialService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = "*")
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    @GetMapping("/vehiculo/{vehiculoId}")
    public List<HistorialMantencionDTO> obtenerHistorial(@PathVariable("vehiculoId") Integer vehiculoId) {
        return historialService.obtenerHistorialPorVehiculo(vehiculoId);
    }
}
