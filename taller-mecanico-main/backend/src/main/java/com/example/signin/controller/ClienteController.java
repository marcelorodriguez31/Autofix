package com.example.signin.controller;

import com.example.signin.model.Cliente;
import com.example.signin.model.Vehiculo;
import com.example.signin.service.ClienteService;
import com.example.signin.service.VehiculoService;
import com.example.signin.dto.ClienteDTO;
import com.example.signin.dto.VehiculoDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteService clienteService;
    private final VehiculoService vehiculoService;

    public ClienteController(ClienteService clienteService, VehiculoService vehiculoService) {
        this.clienteService = clienteService;
        this.vehiculoService = vehiculoService;
    }

    @PostMapping
    public ResponseEntity<ClienteDTO> crearCliente(@RequestBody ClienteDTO clienteDTO) {
        Cliente cliente = new Cliente();
        cliente.setRut(clienteDTO.getRut());
        cliente.setNombre(clienteDTO.getNombre());
        cliente.setTelefono(clienteDTO.getTelefono());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setDireccion(clienteDTO.getDireccion());

        Cliente clienteGuardado = clienteService.crearCliente(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(clienteGuardado));
    }

    @GetMapping
    public ResponseEntity<List<ClienteDTO>> obtenerClientes() {
        List<ClienteDTO> clientes = clienteService.obtenerTodosClientes()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(clientes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteDTO> obtenerClientePorId(@PathVariable("id") Integer id) {
        return clienteService.obtenerClientePorId(id)
                .map(cliente -> ResponseEntity.ok(convertToDTO(cliente)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> actualizarCliente(
            @PathVariable("id") Integer id,
            @RequestBody ClienteDTO clienteDTO
    ) {
        try {
            Cliente clienteActualizado = new Cliente();
                clienteActualizado.setRut(clienteDTO.getRut());
                clienteActualizado.setNombre(clienteDTO.getNombre());
                clienteActualizado.setTelefono(clienteDTO.getTelefono());
                clienteActualizado.setEmail(clienteDTO.getEmail());
                clienteActualizado.setDireccion(clienteDTO.getDireccion());

            Cliente cliente = clienteService.actualizarCliente(id, clienteActualizado);
            return ResponseEntity.ok(convertToDTO(cliente));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable("id") Integer id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{clienteId}/vehiculos")
    public ResponseEntity<VehiculoDTO> crearVehiculo(
            @PathVariable("clienteId") Integer clienteId,
            @RequestBody VehiculoDTO vehiculoDTO
    ) {
        try {
            Vehiculo vehiculo = new Vehiculo();
            vehiculo.setPatente(vehiculoDTO.getPatente());
            vehiculo.setMarca(vehiculoDTO.getMarca());
            vehiculo.setModelo(vehiculoDTO.getModelo());
            vehiculo.setAnio(vehiculoDTO.getAnio());
            vehiculo.setKilometraje(vehiculoDTO.getKilometraje());

            Vehiculo vehiculoGuardado = vehiculoService.crearVehiculo(clienteId, vehiculo);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(vehiculoGuardado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{clienteId}/vehiculos")
    public ResponseEntity<List<VehiculoDTO>> obtenerVehiculosPorCliente(
            @PathVariable("clienteId") Integer clienteId
    ) {
        List<VehiculoDTO> vehiculos = vehiculoService.obtenerVehiculosPorCliente(clienteId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(vehiculos);
    }

    @PutMapping("/vehiculos/{vehiculoId}")
    public ResponseEntity<VehiculoDTO> actualizarVehiculo(
            @PathVariable("vehiculoId") Integer vehiculoId,
            @RequestBody VehiculoDTO vehiculoDTO
    ) {
        try {
            Vehiculo vehiculoActualizado = new Vehiculo();
            vehiculoActualizado.setMarca(vehiculoDTO.getMarca());
            vehiculoActualizado.setModelo(vehiculoDTO.getModelo());
            vehiculoActualizado.setAnio(vehiculoDTO.getAnio());
            vehiculoActualizado.setKilometraje(vehiculoDTO.getKilometraje());

            Vehiculo vehiculo = vehiculoService.actualizarVehiculo(vehiculoId, vehiculoActualizado);
            return ResponseEntity.ok(convertToDTO(vehiculo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/vehiculos/{vehiculoId}")
    public ResponseEntity<Void> eliminarVehiculo(
            @PathVariable("vehiculoId") Integer vehiculoId
    ) {
        vehiculoService.eliminarVehiculo(vehiculoId);
        return ResponseEntity.noContent().build();
    }

    private ClienteDTO convertToDTO(Cliente cliente) {
        return new ClienteDTO(
                cliente.getId(),
                cliente.getRut(),
                cliente.getNombre(),
                cliente.getTelefono(),
                cliente.getEmail(),
                cliente.getDireccion()
        );
    }

    private VehiculoDTO convertToDTO(Vehiculo vehiculo) {
        return new VehiculoDTO(
                vehiculo.getId(),
                vehiculo.getCliente().getId(),
                vehiculo.getPatente(),
                vehiculo.getMarca(),
                vehiculo.getModelo(),
                vehiculo.getAnio(),
                vehiculo.getKilometraje()
        );
    }
}