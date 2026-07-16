package com.example.signin.controller;

import com.example.signin.model.Mecanico;
import com.example.signin.service.MecanicoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mecanicos")
@CrossOrigin(origins = "*")
public class MecanicoController {

    private final MecanicoService mecanicoService;

    public MecanicoController(MecanicoService mecanicoService) {
        this.mecanicoService = mecanicoService;
    }

    @GetMapping
    public List<Mecanico> listar() {
        return mecanicoService.listarMecanicos();
    }

    @GetMapping("/disponibles")
    public List<Mecanico> listarDisponibles() {
        return mecanicoService.listarDisponibles();
    }

    @GetMapping("/{id}")
    public Mecanico obtener(@PathVariable("id") Integer id) {
        return mecanicoService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mecanico crear(@RequestBody Mecanico mecanico) {
        return mecanicoService.crearMecanico(mecanico);
    }

    @PutMapping("/{id}")
    public Mecanico actualizar(@PathVariable("id") Integer id, @RequestBody Mecanico mecanico) {
        return mecanicoService.actualizarMecanico(id, mecanico);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Integer id) {
        mecanicoService.eliminarMecanico(id);
    }
}
