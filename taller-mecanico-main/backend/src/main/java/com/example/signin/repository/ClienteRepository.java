package com.example.signin.repository;

import com.example.signin.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByRut(String rut);
    Optional<Cliente> findByEmail(String email);
}
