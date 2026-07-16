package com.example.signin.service;

import com.example.signin.dto.OrdenTrabajoDTO;
import com.example.signin.model.Mecanico;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.model.Vehiculo;
import com.example.signin.repository.MecanicoRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.VehiculoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrdenTrabajoService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final VehiculoRepository vehiculoRepository;
    private final MecanicoRepository mecanicoRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public OrdenTrabajoService(
            OrdenTrabajoRepository ordenTrabajoRepository,
            VehiculoRepository vehiculoRepository,
            MecanicoRepository mecanicoRepository
    ) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.mecanicoRepository = mecanicoRepository;
    }

    public List<OrdenTrabajo> listarOrdenes() {
        return ordenTrabajoRepository.findAll();
    }

    public OrdenTrabajo crearOrden(OrdenTrabajoDTO dto) {
        Vehiculo vehiculo = vehiculoRepository.findById(dto.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        OrdenTrabajo orden = new OrdenTrabajo();
        orden.setDiagnosticoPreliminar(dto.getDiagnosticoPreliminar());
        orden.setVehiculo(vehiculo);

        if (dto.getMecanicoId() != null) {
            Mecanico mecanico = mecanicoRepository.findById(dto.getMecanicoId())
                    .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));
            orden.setMecanico(mecanico);
            orden.setEstado("ASIGNADA");
        } else {
            orden.setEstado(dto.getEstado() != null ? dto.getEstado() : "CREADA");
        }

        return ordenTrabajoRepository.save(orden);
    }

    public OrdenTrabajo asignarMecanico(Long ordenId, Integer mecanicoId) {
        OrdenTrabajo orden = ordenTrabajoRepository.findById(ordenId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        Mecanico mecanico = mecanicoRepository.findById(mecanicoId)
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));

        orden.setMecanico(mecanico);
        orden.setEstado("ASIGNADA");

        return ordenTrabajoRepository.save(orden);
    }

    public List<OrdenTrabajo> obtenerPorVehiculo(Integer vehiculoId) {
        return ordenTrabajoRepository.findByVehiculoId(vehiculoId);
    }

    public List<OrdenTrabajo> obtenerPorEstado(String estado) {
        return ordenTrabajoRepository.findByEstado(estado);
    }

    public OrdenTrabajo obtenerPorId(Long id) {
        return ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
    }

    @Transactional
    public void eliminar(Long id) {
        entityManager.createNativeQuery("DELETE FROM orden_trabajo WHERE id = :id")
                .setParameter("id", id)
                .executeUpdate();
    }
}
