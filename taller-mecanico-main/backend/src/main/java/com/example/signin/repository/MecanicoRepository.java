package com.example.signin.repository;

import com.example.signin.model.Mecanico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MecanicoRepository extends JpaRepository<Mecanico, Integer> {
    List<Mecanico> findByDisponible(Boolean disponible);
}
