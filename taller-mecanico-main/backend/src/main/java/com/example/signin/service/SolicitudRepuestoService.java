package com.example.signin.service;

import com.example.signin.dto.SolicitudRepuestoDTO;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.model.Repuesto;
import com.example.signin.model.SolicitudRepuesto;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.RepuestoRepository;
import com.example.signin.repository.SolicitudRepuestoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class SolicitudRepuestoService {

    private static final Set<String> ESTADOS_VALIDOS =
            Set.of(
                    "PENDIENTE",
                    "APROBADA",
                    "RECHAZADA",
                    "RECIBIDA"
            );

    private final SolicitudRepuestoRepository solicitudRepuestoRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final RepuestoRepository repuestoRepository;

    public SolicitudRepuestoService(
            SolicitudRepuestoRepository solicitudRepuestoRepository,
            OrdenTrabajoRepository ordenTrabajoRepository,
            RepuestoRepository repuestoRepository
    ) {
        this.solicitudRepuestoRepository =
                solicitudRepuestoRepository;

        this.ordenTrabajoRepository =
                ordenTrabajoRepository;

        this.repuestoRepository =
                repuestoRepository;
    }

    public List<SolicitudRepuesto> listarSolicitudes() {
        return solicitudRepuestoRepository.findAll();
    }

    public SolicitudRepuesto obtenerPorId(Long id) {
        return solicitudRepuestoRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Solicitud no encontrada"
                        )
                );
    }

    public List<SolicitudRepuesto> obtenerPorOrden(
            Long ordenTrabajoId
    ) {
        return solicitudRepuestoRepository
                .findByOrdenTrabajoId(
                        ordenTrabajoId
                );
    }

    public List<SolicitudRepuesto> obtenerPorEstado(
            String estado
    ) {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException(
                    "El estado es obligatorio"
            );
        }

        String estadoNormalizado =
                estado.trim().toUpperCase();

        if (!ESTADOS_VALIDOS.contains(estadoNormalizado)) {
            throw new IllegalArgumentException(
                    "El estado de la solicitud no es válido"
            );
        }

        return solicitudRepuestoRepository
                .findByEstado(estadoNormalizado);
    }

    @Transactional
    public SolicitudRepuesto crearSolicitud(
            SolicitudRepuestoDTO dto
    ) {
        validarDatosSolicitud(dto);

        OrdenTrabajo orden =
                ordenTrabajoRepository
                        .findById(
                                dto.getOrdenTrabajoId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Orden de trabajo no encontrada"
                                )
                        );

        Repuesto repuesto =
                repuestoRepository
                        .findById(
                                dto.getRepuestoId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repuesto no encontrado"
                                )
                        );

        int stockActual =
                repuesto.getStock() == null
                        ? 0
                        : repuesto.getStock();

        if (stockActual < dto.getCantidad()) {
            throw new IllegalArgumentException(
                    "Stock insuficiente. Stock disponible: "
                            + stockActual
            );
        }

        String estadoInicial =
                normalizarEstadoInicial(
                        dto.getEstado()
                );

        SolicitudRepuesto solicitud =
                new SolicitudRepuesto();

        solicitud.setOrdenTrabajo(orden);
        solicitud.setRepuesto(repuesto);
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setEstado(estadoInicial);

        /*
         * Se conserva la lógica actual:
         * el stock se descuenta al crear la solicitud.
         */
        repuesto.setStock(
                stockActual - dto.getCantidad()
        );

        repuestoRepository.save(repuesto);

        orden.setEstado("ESPERANDO_REPUESTOS");
        ordenTrabajoRepository.save(orden);

        return solicitudRepuestoRepository
                .save(solicitud);
    }

    /**
     * Confirma que el repuesto asociado a la solicitud fue recibido.
     * Solamente las solicitudes APROBADAS pueden pasar a RECIBIDA.
     */
    @Transactional
    public SolicitudRepuesto confirmarRecepcion(
            Long id
    ) {
        SolicitudRepuesto solicitud =
                solicitudRepuestoRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Solicitud no encontrada"
                                )
                        );

        String estadoActual =
                solicitud.getEstado() == null
                        ? ""
                        : solicitud.getEstado()
                                .trim()
                                .toUpperCase();

        if ("RECIBIDA".equals(estadoActual)) {
            throw new IllegalStateException(
                    "La recepción de esta solicitud ya fue confirmada"
            );
        }

        if (!"APROBADA".equals(estadoActual)) {
            throw new IllegalStateException(
                    "Solo se puede confirmar la recepción de una solicitud aprobada"
            );
        }

        solicitud.setEstado("RECIBIDA");

        solicitud.setFechaRecepcion(
                LocalDateTime.now()
        );

        /*
         * La orden vuelve al flujo de reparación,
         * porque el repuesto solicitado ya fue recibido.
         */
        OrdenTrabajo orden =
                solicitud.getOrdenTrabajo();

        if (
                orden != null
                && !"FINALIZADA".equalsIgnoreCase(
                        orden.getEstado()
                )
        ) {
            orden.setEstado("EN_PROCESO");
            ordenTrabajoRepository.save(orden);
        }

        return solicitudRepuestoRepository
                .save(solicitud);
    }

    @Transactional
    public void eliminarSolicitud(Long id) {
        SolicitudRepuesto solicitud =
                solicitudRepuestoRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Solicitud no encontrada"
                                )
                        );

        solicitudRepuestoRepository.delete(
                solicitud
        );
    }

    private void validarDatosSolicitud(
            SolicitudRepuestoDTO dto
    ) {
        if (dto == null) {
            throw new IllegalArgumentException(
                    "Los datos de la solicitud son obligatorios"
            );
        }

        if (dto.getOrdenTrabajoId() == null) {
            throw new IllegalArgumentException(
                    "La orden de trabajo es obligatoria"
            );
        }

        if (dto.getRepuestoId() == null) {
            throw new IllegalArgumentException(
                    "El repuesto es obligatorio"
            );
        }

        if (
                dto.getCantidad() == null
                || dto.getCantidad() <= 0
        ) {
            throw new IllegalArgumentException(
                    "La cantidad solicitada debe ser mayor que cero"
            );
        }

        if (
                dto.getEstado() != null
                && !dto.getEstado().isBlank()
        ) {
            String estado =
                    dto.getEstado()
                            .trim()
                            .toUpperCase();

            if (
                    !"PENDIENTE".equals(estado)
                    && !"APROBADA".equals(estado)
                    && !"RECHAZADA".equals(estado)
            ) {
                throw new IllegalArgumentException(
                        "El estado inicial debe ser PENDIENTE, APROBADA o RECHAZADA"
                );
            }
        }
    }

    private String normalizarEstadoInicial(
            String estado
    ) {
        if (
                estado == null
                || estado.isBlank()
        ) {
            return "PENDIENTE";
        }

        return estado.trim().toUpperCase();
    }
}