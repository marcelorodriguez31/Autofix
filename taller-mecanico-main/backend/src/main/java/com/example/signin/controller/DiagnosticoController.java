package com.example.signin.controller;

import com.example.signin.dto.DiagnosticoDTO;
import com.example.signin.model.Diagnostico;
import com.example.signin.service.DiagnosticoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosticos")
@CrossOrigin(origins = "*")
public class DiagnosticoController {

    private final DiagnosticoService diagnosticoService;

    public DiagnosticoController(DiagnosticoService diagnosticoService) {
        this.diagnosticoService = diagnosticoService;
    }

    @GetMapping
    public List<Diagnostico> listar() {
        return diagnosticoService.listarDiagnosticos();
    }

    @GetMapping("/{id}")
    public Diagnostico obtener(@PathVariable("id") Long id) {
        return diagnosticoService.obtenerPorId(id);
    }

    @GetMapping("/orden/{ordenTrabajoId}")
    public Diagnostico obtenerPorOrden(@PathVariable("ordenTrabajoId") Long ordenTrabajoId) {
        return diagnosticoService.obtenerPorOrden(ordenTrabajoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Diagnostico crear(@RequestBody DiagnosticoDTO dto) {
        return diagnosticoService.crearDiagnostico(dto);
    }

    @PutMapping("/{id}")
    public Diagnostico actualizar(@PathVariable("id") Long id, @RequestBody DiagnosticoDTO dto) {
        return diagnosticoService.actualizarDiagnostico(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        diagnosticoService.eliminarDiagnostico(id);
    }
}
