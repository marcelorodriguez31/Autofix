package com.example.signin.repository;

import com.example.signin.model.Diagnostico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Long> {
    Optional<Diagnostico> findByOrdenTrabajoId(Long ordenTrabajoId);
}
