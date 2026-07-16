package com.example.signin.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ReservaDTO {

    private LocalDate fecha;
    private LocalTime hora;
    private String motivo;
    private String estado;
    private Integer clienteId;
    private Integer vehiculoId;

    public LocalDate getFecha() { return fecha; }
    public LocalTime getHora() { return hora; }
    public String getMotivo() { return motivo; }
    public String getEstado() { return estado; }
    public Integer getClienteId() { return clienteId; }
    public Integer getVehiculoId() { return vehiculoId; }

    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public void setHora(LocalTime hora) { this.hora = hora; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public void setEstado(String estado) { this.estado = estado; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public void setVehiculoId(Integer vehiculoId) { this.vehiculoId = vehiculoId; }
}
