package com.example.signin.repository;

import com.example.signin.model.SolicitudRepuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudRepuestoRepository extends JpaRepository<SolicitudRepuesto, Long> {
    List<SolicitudRepuesto> findByOrdenTrabajoId(Long ordenTrabajoId);
    List<SolicitudRepuesto> findByEstado(String estado);
    boolean existsByRepuestoId(Long repuestoId);
}
