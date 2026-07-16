package com.example.signin.repository;

import com.example.signin.model.OrdenTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long> {

    List<OrdenTrabajo> findByVehiculoId(Integer vehiculoId);

    List<OrdenTrabajo> findByEstado(String estado);

    boolean existsByMecanicoId(Integer mecanicoId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM orden_trabajo WHERE id = :id", nativeQuery = true)
    void deleteOrdenById(@Param("id") Long id);
}
