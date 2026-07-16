package com.example.signin.service;

import com.example.signin.dto.DiagnosticoDTO;
import com.example.signin.model.Diagnostico;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.repository.DiagnosticoRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiagnosticoService {

    private final DiagnosticoRepository diagnosticoRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public DiagnosticoService(DiagnosticoRepository diagnosticoRepository, OrdenTrabajoRepository ordenTrabajoRepository) {
        this.diagnosticoRepository = diagnosticoRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }

    public List<Diagnostico> listarDiagnosticos() {
        return diagnosticoRepository.findAll();
    }

    public Diagnostico obtenerPorId(Long id) {
        return diagnosticoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Diagnóstico no encontrado"));
    }

    public Diagnostico obtenerPorOrden(Long ordenTrabajoId) {
        return diagnosticoRepository.findByOrdenTrabajoId(ordenTrabajoId)
                .orElseThrow(() -> new RuntimeException("Diagnóstico no encontrado para esta orden"));
    }

    public Diagnostico crearDiagnostico(DiagnosticoDTO dto) {
        OrdenTrabajo orden = ordenTrabajoRepository.findById(dto.getOrdenTrabajoId())
                .orElseThrow(() -> new RuntimeException("Orden de trabajo no encontrada"));
        if (diagnosticoRepository.findByOrdenTrabajoId(dto.getOrdenTrabajoId()).isPresent()) {
            throw new RuntimeException("Esta orden ya tiene un diagnóstico registrado");
        }
        Diagnostico diagnostico = new Diagnostico();
        diagnostico.setFallas(dto.getFallas());
        diagnostico.setObservaciones(dto.getObservaciones());
        diagnostico.setRecomendaciones(dto.getRecomendaciones());
        diagnostico.setOrdenTrabajo(orden);
        orden.setEstado("DIAGNOSTICADA");
        ordenTrabajoRepository.save(orden);
        return diagnosticoRepository.save(diagnostico);
    }

    public Diagnostico actualizarDiagnostico(Long id, DiagnosticoDTO dto) {
        Diagnostico diagnostico = diagnosticoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Diagnóstico no encontrado"));
        diagnostico.setFallas(dto.getFallas());
        diagnostico.setObservaciones(dto.getObservaciones());
        diagnostico.setRecomendaciones(dto.getRecomendaciones());
        return diagnosticoRepository.save(diagnostico);
    }

    public void eliminarDiagnostico(Long id) {
        diagnosticoRepository.deleteById(id);
    }
}
