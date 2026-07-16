package com.example.signin.repository;

import com.example.signin.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByVehiculoId(Integer vehiculoId);
    List<Reserva> findByClienteId(Integer clienteId);
}
