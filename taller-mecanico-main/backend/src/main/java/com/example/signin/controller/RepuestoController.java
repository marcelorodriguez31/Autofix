package com.example.signin.controller;

import com.example.signin.dto.RepuestoDTO;
import com.example.signin.dto.StockDTO;
import com.example.signin.model.Repuesto;
import com.example.signin.service.RepuestoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repuestos")
@CrossOrigin(origins = "*")
public class RepuestoController {

    private final RepuestoService repuestoService;

    public RepuestoController(RepuestoService repuestoService) {
        this.repuestoService = repuestoService;
    }

    @GetMapping
    public List<Repuesto> listar() {
        return repuestoService.listarRepuestos();
    }

    @GetMapping("/{id}")
    public Repuesto obtener(@PathVariable("id") Long id) {
        return repuestoService.obtenerPorId(id);
    }

    @GetMapping("/stock-bajo/{limite}")
    public List<Repuesto> stockBajo(@PathVariable("limite") Integer limite) {
        return repuestoService.obtenerStockBajo(limite);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Repuesto crear(@RequestBody RepuestoDTO dto) {
        return repuestoService.crearRepuesto(dto);
    }

    @PutMapping("/{id}")
    public Repuesto actualizar(@PathVariable("id") Long id, @RequestBody RepuestoDTO dto) {
        return repuestoService.actualizarRepuesto(id, dto);
    }

    @PutMapping("/{id}/aumentar-stock")
    public Repuesto aumentarStock(@PathVariable("id") Long id, @RequestBody StockDTO dto) {
        return repuestoService.aumentarStock(id, dto.getCantidad());
    }

    @PutMapping("/{id}/disminuir-stock")
    public Repuesto disminuirStock(@PathVariable("id") Long id, @RequestBody StockDTO dto) {
        return repuestoService.disminuirStock(id, dto.getCantidad());
    }

    @PutMapping("/{id}/ajustar-stock")
    public Repuesto ajustarStock(@PathVariable("id") Long id, @RequestBody StockDTO dto) {
        return repuestoService.ajustarStock(id, dto.getCantidad());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        repuestoService.eliminarRepuesto(id);
    }
}
