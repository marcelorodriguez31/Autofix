package com.example.signin.service;

import com.example.signin.dto.HistorialMantencionDTO;
import com.example.signin.model.*;
import com.example.signin.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class HistorialService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final PresupuestoRepository presupuestoRepository;
    private final DocumentoPagoRepository documentoPagoRepository;

    public HistorialService(OrdenTrabajoRepository ordenTrabajoRepository,
                            DiagnosticoRepository diagnosticoRepository,
                            PresupuestoRepository presupuestoRepository,
                            DocumentoPagoRepository documentoPagoRepository) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.diagnosticoRepository = diagnosticoRepository;
        this.presupuestoRepository = presupuestoRepository;
        this.documentoPagoRepository = documentoPagoRepository;
    }

    @Transactional(readOnly = true)
    public List<HistorialMantencionDTO> obtenerHistorialPorVehiculo(Integer vehiculoId) {
        List<OrdenTrabajo> ordenes = ordenTrabajoRepository.findByVehiculoId(vehiculoId);
        List<HistorialMantencionDTO> historial = new ArrayList<>();

        for (OrdenTrabajo orden : ordenes) {
            HistorialMantencionDTO dto = new HistorialMantencionDTO();
            dto.setOrdenId(orden.getId());
            dto.setNumeroOrden(orden.getNumero());
            dto.setFechaIngreso(orden.getFechaIngreso());
            dto.setEstadoOrden(orden.getEstado());
            dto.setDiagnosticoPreliminar(orden.getDiagnosticoPreliminar());

            Vehiculo vehiculo = orden.getVehiculo();
            dto.setVehiculoId(vehiculo.getId());
            dto.setPatente(vehiculo.getPatente());
            dto.setMarca(vehiculo.getMarca());
            dto.setModelo(vehiculo.getModelo());

            Cliente cliente = vehiculo.getCliente();
            if (cliente != null) {
                dto.setClienteId(cliente.getId());
                dto.setNombreCliente(cliente.getNombre());
                dto.setRutCliente(cliente.getRut());
            }

            if (orden.getMecanico() != null) {
                dto.setMecanicoNombre(orden.getMecanico().getNombre());
                dto.setMecanicoEspecialidad(orden.getMecanico().getEspecialidad());
            }

            diagnosticoRepository.findByOrdenTrabajoId(orden.getId())
                    .ifPresent(diagnostico -> {
                        dto.setFallas(diagnostico.getFallas());
                        dto.setObservaciones(diagnostico.getObservaciones());
                        dto.setRecomendaciones(diagnostico.getRecomendaciones());
                    });

            presupuestoRepository.findByOrdenTrabajoId(orden.getId())
                    .ifPresent(presupuesto -> {
                        dto.setMontoPresupuesto(presupuesto.getMontoTotal());
                        dto.setEstadoPresupuesto(presupuesto.getEstadoAprobacion());
                    });

            documentoPagoRepository.findByOrdenTrabajoId(orden.getId())
                    .ifPresent(documento -> {
                        dto.setTipoDocumento(documento.getTipoDocumento());
                        dto.setMontoPagado(documento.getMonto());
                    });

            historial.add(dto);
        }
        return historial;
    }
}
