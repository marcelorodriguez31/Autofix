package com.example.signin.repository;

import com.example.signin.model.AvanceReparacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvanceReparacionRepository extends JpaRepository<AvanceReparacion, Long> {
    List<AvanceReparacion> findByOrdenTrabajoId(Long ordenTrabajoId);
    List<AvanceReparacion> findByEstado(String estado);
}
