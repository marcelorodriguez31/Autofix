package com.example.signin.service;

import com.example.signin.dto.ReservaDTO;
import com.example.signin.model.Cliente;
import com.example.signin.model.Reserva;
import com.example.signin.model.Vehiculo;
import com.example.signin.repository.ClienteRepository;
import com.example.signin.repository.ReservaRepository;
import com.example.signin.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final VehiculoRepository vehiculoRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            VehiculoRepository vehiculoRepository
    ) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    public List<Reserva> listarReservas() {
        return reservaRepository.findAll();
    }

    public Reserva crearReserva(ReservaDTO reservaDTO) {
        Cliente cliente = clienteRepository.findById(reservaDTO.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Vehiculo vehiculo = vehiculoRepository.findById(reservaDTO.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        Reserva reserva = new Reserva();
        reserva.setFecha(reservaDTO.getFecha());
        reserva.setHora(reservaDTO.getHora());
        reserva.setMotivo(reservaDTO.getMotivo());
        reserva.setEstado(reservaDTO.getEstado());
        reserva.setCliente(cliente);
        reserva.setVehiculo(vehiculo);

        return reservaRepository.save(reserva);
    }
}