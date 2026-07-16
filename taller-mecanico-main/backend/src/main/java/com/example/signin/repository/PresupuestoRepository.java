package com.example.signin.repository;

import com.example.signin.model.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
    Optional<Presupuesto> findByOrdenTrabajoId(Long ordenTrabajoId);
}
