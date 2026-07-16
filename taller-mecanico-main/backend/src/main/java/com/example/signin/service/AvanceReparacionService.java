package com.example.signin.service;

import com.example.signin.dto.AvanceReparacionDTO;
import com.example.signin.model.AvanceReparacion;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.repository.AvanceReparacionRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvanceReparacionService {

    private final AvanceReparacionRepository avanceReparacionRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public AvanceReparacionService(
            AvanceReparacionRepository avanceReparacionRepository,
            OrdenTrabajoRepository ordenTrabajoRepository
    ) {
        this.avanceReparacionRepository = avanceReparacionRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }

    public List<AvanceReparacion> listarAvances() {
        return avanceReparacionRepository.findAll();
    }

    public AvanceReparacion obtenerPorId(Long id) {
        return avanceReparacionRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Avance no encontrado"
                        )
                );
    }

    public List<AvanceReparacion> obtenerPorOrden(
            Long ordenTrabajoId
    ) {
        return avanceReparacionRepository
                .findByOrdenTrabajoId(ordenTrabajoId);
    }

    public List<AvanceReparacion> obtenerPorEstado(
            String estado
    ) {
        return avanceReparacionRepository.findByEstado(estado);
    }

    public AvanceReparacion crearAvance(
            AvanceReparacionDTO dto
    ) {
        validarDatosAvance(dto);

        OrdenTrabajo orden =
                ordenTrabajoRepository
                        .findById(dto.getOrdenTrabajoId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Orden de trabajo no encontrada"
                                )
                        );

        AvanceReparacion avance =
                new AvanceReparacion();

        avance.setDescripcion(
                dto.getDescripcion().trim()
        );

        avance.setPorcentajeAvance(
                dto.getPorcentajeAvance()
        );

        avance.setEstado(
                dto.getEstado()
        );

        avance.setOrdenTrabajo(orden);

        actualizarEstadoOrden(
                orden,
                dto.getPorcentajeAvance()
        );

        ordenTrabajoRepository.save(orden);

        return avanceReparacionRepository.save(
                avance
        );
    }

    public AvanceReparacion actualizarAvance(
            Long id,
            AvanceReparacionDTO dto
    ) {
        validarDatosAvance(dto);

        AvanceReparacion avance =
                avanceReparacionRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Avance no encontrado"
                                )
                        );

        avance.setDescripcion(
                dto.getDescripcion().trim()
        );

        avance.setPorcentajeAvance(
                dto.getPorcentajeAvance()
        );

        avance.setEstado(
                dto.getEstado()
        );

        OrdenTrabajo orden =
                avance.getOrdenTrabajo();

        actualizarEstadoOrden(
                orden,
                dto.getPorcentajeAvance()
        );

        ordenTrabajoRepository.save(orden);

        return avanceReparacionRepository.save(
                avance
        );
    }

    public void eliminarAvance(Long id) {
        AvanceReparacion avance =
                avanceReparacionRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Avance no encontrado"
                                )
                        );

        avanceReparacionRepository.delete(avance);
    }

    private void validarDatosAvance(
            AvanceReparacionDTO dto
    ) {
        if (dto == null) {
            throw new IllegalArgumentException(
                    "Los datos del avance son obligatorios"
            );
        }

        if (dto.getOrdenTrabajoId() == null) {
            throw new IllegalArgumentException(
                    "La orden de trabajo es obligatoria"
            );
        }

        if (
                dto.getDescripcion() == null
                || dto.getDescripcion().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "La descripción del avance es obligatoria"
            );
        }

        if (
                dto.getEstado() == null
                || dto.getEstado().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El estado del avance es obligatorio"
            );
        }

        validarPorcentaje(
                dto.getPorcentajeAvance()
        );
    }

    private void validarPorcentaje(
            Integer porcentaje
    ) {
        if (porcentaje == null) {
            throw new IllegalArgumentException(
                    "El porcentaje de avance es obligatorio"
            );
        }

        if (
                porcentaje < 0
                || porcentaje > 100
                || porcentaje % 5 != 0
        ) {
            throw new IllegalArgumentException(
                    "El porcentaje debe estar entre 0 y 100 y avanzar de 5 en 5"
            );
        }
    }

    private void actualizarEstadoOrden(
            OrdenTrabajo orden,
            Integer porcentaje
    ) {
        if (porcentaje >= 100) {
            orden.setEstado("FINALIZADA");
        } else {
            /*
             * Se usa EN_PROCESO para coincidir con los filtros
             * del frontend de órdenes.
             */
            orden.setEstado("EN_PROCESO");
        }
    }
}