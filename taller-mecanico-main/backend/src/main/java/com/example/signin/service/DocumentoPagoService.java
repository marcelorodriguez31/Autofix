package com.example.signin.service;

import com.example.signin.dto.DocumentoPagoDTO;
import com.example.signin.model.DocumentoPago;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.model.Presupuesto;
import com.example.signin.repository.DocumentoPagoRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.PresupuestoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentoPagoService {

    private final DocumentoPagoRepository documentoPagoRepository;
    private final PresupuestoRepository presupuestoRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public DocumentoPagoService(DocumentoPagoRepository documentoPagoRepository,
                                PresupuestoRepository presupuestoRepository,
                                OrdenTrabajoRepository ordenTrabajoRepository) {
        this.documentoPagoRepository = documentoPagoRepository;
        this.presupuestoRepository = presupuestoRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }

    public List<DocumentoPago> listarDocumentos() {
        return documentoPagoRepository.findAll();
    }

    public DocumentoPago obtenerPorId(Long id) {
        return documentoPagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento de pago no encontrado"));
    }

    public DocumentoPago obtenerPorPresupuesto(Long presupuestoId) {
        return documentoPagoRepository.findByPresupuestoId(presupuestoId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado para este presupuesto"));
    }

    public DocumentoPago obtenerPorOrden(Long ordenTrabajoId) {
        return documentoPagoRepository.findByOrdenTrabajoId(ordenTrabajoId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado para esta orden"));
    }

    public DocumentoPago crearDocumento(DocumentoPagoDTO dto) {
        Presupuesto presupuesto = presupuestoRepository.findById(dto.getPresupuestoId())
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
        if (!"APROBADO".equalsIgnoreCase(presupuesto.getEstadoAprobacion())) {
            throw new RuntimeException("No se puede emitir documento: el presupuesto no está aprobado");
        }
        if (documentoPagoRepository.findByPresupuestoId(dto.getPresupuestoId()).isPresent()) {
            throw new RuntimeException("Este presupuesto ya tiene un documento de pago emitido");
        }
        OrdenTrabajo orden = presupuesto.getOrdenTrabajo();
        DocumentoPago documento = new DocumentoPago();
        documento.setPresupuesto(presupuesto);
        documento.setOrdenTrabajo(orden);
        documento.setTipoDocumento(dto.getTipoDocumento());
        documento.setMonto(presupuesto.getMontoTotal());
        orden.setEstado("PAGADA");
        ordenTrabajoRepository.save(orden);
        return documentoPagoRepository.save(documento);
    }

    public void eliminarDocumento(Long id) {
        documentoPagoRepository.deleteById(id);
    }
}
