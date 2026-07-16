package com.example.signin.controller;

import com.example.signin.dto.PresupuestoDTO;
import com.example.signin.model.Presupuesto;
import com.example.signin.service.PresupuestoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presupuestos")
@CrossOrigin(origins = "*")
public class PresupuestoController {

    private final PresupuestoService presupuestoService;

    public PresupuestoController(PresupuestoService presupuestoService) {
        this.presupuestoService = presupuestoService;
    }

    @GetMapping
    public List<Presupuesto> listar() {
        return presupuestoService.listarPresupuestos();
    }

    @GetMapping("/{id}")
    public Presupuesto obtener(@PathVariable("id") Long id) {
        return presupuestoService.obtenerPorId(id);
    }

    @GetMapping("/orden/{ordenTrabajoId}")
    public Presupuesto obtenerPorOrden(@PathVariable("ordenTrabajoId") Long ordenTrabajoId) {
        return presupuestoService.obtenerPorOrden(ordenTrabajoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Presupuesto crear(@RequestBody PresupuestoDTO dto) {
        return presupuestoService.crearPresupuesto(dto);
    }

    @PutMapping("/{id}/aprobar")
    public Presupuesto aprobar(@PathVariable("id") Long id) {
        return presupuestoService.aprobarPresupuesto(id);
    }

    @PutMapping("/{id}/rechazar")
    public Presupuesto rechazar(@PathVariable("id") Long id) {
        return presupuestoService.rechazarPresupuesto(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        presupuestoService.eliminarPresupuesto(id);
    }
}
