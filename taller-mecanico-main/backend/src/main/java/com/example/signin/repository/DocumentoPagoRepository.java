package com.example.signin.repository;

import com.example.signin.model.DocumentoPago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentoPagoRepository extends JpaRepository<DocumentoPago, Long> {
    Optional<DocumentoPago> findByPresupuestoId(Long presupuestoId);
    Optional<DocumentoPago> findByOrdenTrabajoId(Long ordenTrabajoId);
}
