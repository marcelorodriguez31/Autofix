package com.example.signin.repository;

import com.example.signin.model.Repuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepuestoRepository
        extends JpaRepository<Repuesto, Long> {

    List<Repuesto> findByStockLessThanEqual(
            Integer limite
    );

    boolean existsByCodigo(String codigo);

    Optional<Repuesto> findTopByOrderByIdDesc();
}