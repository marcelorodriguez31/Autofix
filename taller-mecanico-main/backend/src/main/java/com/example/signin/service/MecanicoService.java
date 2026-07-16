package com.example.signin.service;

import com.example.signin.model.Mecanico;
import com.example.signin.repository.MecanicoRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MecanicoService {

    private final MecanicoRepository mecanicoRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public MecanicoService(MecanicoRepository mecanicoRepository, OrdenTrabajoRepository ordenTrabajoRepository) {
        this.mecanicoRepository = mecanicoRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }

    public List<Mecanico> listarMecanicos() {
        return mecanicoRepository.findAll();
    }

    public List<Mecanico> listarDisponibles() {
        return mecanicoRepository.findByDisponible(true);
    }

    public Mecanico obtenerPorId(Integer id) {
        return mecanicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));
    }

    public Mecanico crearMecanico(Mecanico mecanico) {
        if (mecanico.getDisponible() == null) {
            mecanico.setDisponible(true);
        }
        return mecanicoRepository.save(mecanico);
    }

    public Mecanico actualizarMecanico(Integer id, Mecanico mecanicoActualizado) {
        Mecanico mecanico = mecanicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));
        mecanico.setRut(mecanicoActualizado.getRut());
        mecanico.setNombre(mecanicoActualizado.getNombre());
        mecanico.setEspecialidad(mecanicoActualizado.getEspecialidad());
        mecanico.setDisponible(mecanicoActualizado.getDisponible());
        return mecanicoRepository.save(mecanico);
    }

    public void eliminarMecanico(Integer id) {
        mecanicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));
        if (ordenTrabajoRepository.existsByMecanicoId(id)) {
            throw new RuntimeException("No se puede eliminar este mecánico porque tiene órdenes de trabajo asignadas. Reasigne las órdenes primero.");
        }
        mecanicoRepository.deleteById(id);
    }
}
