package com.example.signin.controller;

import com.example.signin.dto.VehiculoDTO;
import com.example.signin.model.Vehiculo;
import com.example.signin.service.VehiculoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @GetMapping
    public List<Vehiculo> listarVehiculos() {
        return vehiculoService.listarVehiculos();
    }

    @PostMapping
    public Vehiculo crearVehiculo(@RequestBody VehiculoDTO dto) {

        Vehiculo vehiculo = new Vehiculo();

        vehiculo.setPatente(dto.getPatente());
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setAnio(dto.getAnio());
        vehiculo.setKilometraje(dto.getKilometraje());

        return vehiculoService.crearVehiculo(dto.getClienteId(), vehiculo);
    }

    @PutMapping("/{id}")
        public ResponseEntity<Vehiculo> actualizarVehiculo(
                @PathVariable("id") Integer id,
                @RequestBody VehiculoDTO dto
        ) {
            Vehiculo vehiculoActualizado = new Vehiculo();

            vehiculoActualizado.setMarca(dto.getMarca());
            vehiculoActualizado.setModelo(dto.getModelo());
            vehiculoActualizado.setAnio(dto.getAnio());
            vehiculoActualizado.setKilometraje(
                    dto.getKilometraje()
            );

            Vehiculo vehiculoGuardado =
                    vehiculoService.actualizarVehiculo(
                            id,
                            vehiculoActualizado
                    );

            return ResponseEntity.ok(vehiculoGuardado);
        }
    @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarVehiculo(
                @PathVariable("id") Integer id
        ) {
            vehiculoService.eliminarVehiculo(id);

            return ResponseEntity.noContent().build();
        }
}