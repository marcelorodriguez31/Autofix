package com.example.signin.service;

import com.example.signin.model.Cliente;
import com.example.signin.model.Vehiculo;
import com.example.signin.repository.ClienteRepository;
import com.example.signin.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ClienteRepository clienteRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository, ClienteRepository clienteRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<Vehiculo> listarVehiculos() {
        return vehiculoRepository.findAll();
    }

    public Vehiculo crearVehiculo(Vehiculo vehiculo) {
        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo crearVehiculo(Integer clienteId, Vehiculo vehiculo) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(
                        () -> new RuntimeException("Cliente no encontrado")
                );

        vehiculo.setPatente(
                vehiculo.getPatente().trim().toUpperCase()
        );

        vehiculo.setCliente(cliente);

        return vehiculoRepository.save(vehiculo);
    }

    public List<Vehiculo> obtenerVehiculosPorCliente(Integer clienteId) {
        return vehiculoRepository.findByClienteId(clienteId);
    }

    public Vehiculo actualizarVehiculo(
            Integer id,
            Vehiculo vehiculoActualizado
    ) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Vehículo no encontrado")
                );

        /*
        * La patente no se modifica porque identifica al vehículo.
        */
        vehiculo.setMarca(vehiculoActualizado.getMarca().trim());
        vehiculo.setModelo(vehiculoActualizado.getModelo().trim());
        vehiculo.setAnio(vehiculoActualizado.getAnio());
        vehiculo.setKilometraje(
                vehiculoActualizado.getKilometraje()
        );

        return vehiculoRepository.save(vehiculo);
    }

    public void eliminarVehiculo(Integer id) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Vehículo no encontrado")
                );

        vehiculoRepository.delete(vehiculo);
    }
}