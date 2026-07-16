package com.example.signin.repository;

import com.example.signin.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    Optional<Empresa> findByNombreIgnoreCase(String nombre);
}