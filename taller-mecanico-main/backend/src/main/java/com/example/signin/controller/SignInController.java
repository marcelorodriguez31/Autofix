package com.example.signin.controller;

import com.example.signin.model.Empresa;
import com.example.signin.repository.EmpresaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class SignInController {

    private final EmpresaRepository empresaRepository;

    public SignInController(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signIn(
            @RequestBody Map<String, String> credentials
    ) {
        String nombreEmpresa =
                credentials.getOrDefault("empresa", "").trim();

        String password =
                credentials.getOrDefault("password", "");

        Map<String, Object> response = new HashMap<>();

        if (nombreEmpresa.isBlank() || password.isBlank()) {
            response.put("success", false);
            response.put(
                    "message",
                    "Debe ingresar la empresa y la contraseña"
            );

            return ResponseEntity.badRequest().body(response);
        }

        Optional<Empresa> empresaOptional =
                empresaRepository.findByNombreIgnoreCase(nombreEmpresa);

        if (empresaOptional.isEmpty()) {
            response.put("success", false);
            response.put(
                    "message",
                    "La empresa ingresada no se encuentra registrada"
            );

            return ResponseEntity.status(401).body(response);
        }

        Empresa empresa = empresaOptional.get();

        if (!Boolean.TRUE.equals(empresa.getActiva())) {
            response.put("success", false);
            response.put(
                    "message",
                    "La empresa se encuentra deshabilitada"
            );

            return ResponseEntity.status(403).body(response);
        }

        if (!empresa.getPassword().equals(password)) {
            response.put("success", false);
            response.put("message", "Contraseña incorrecta");

            return ResponseEntity.status(401).body(response);
        }

        response.put("success", true);
        response.put("empresaId", empresa.getId());
        response.put("empresa", empresa.getNombre());
        response.put("message", "Inicio de sesión exitoso");

        return ResponseEntity.ok(response);
    }
}