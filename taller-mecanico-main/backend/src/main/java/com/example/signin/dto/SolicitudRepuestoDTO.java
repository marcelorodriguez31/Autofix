package com.example.signin.dto;

public class SolicitudRepuestoDTO {

    private Long ordenTrabajoId;
    private Long repuestoId;
    private Integer cantidad;
    private String estado;

    public SolicitudRepuestoDTO() {}

    public Long getOrdenTrabajoId() { return ordenTrabajoId; }
    public void setOrdenTrabajoId(Long ordenTrabajoId) { this.ordenTrabajoId = ordenTrabajoId; }

    public Long getRepuestoId() { return repuestoId; }
    public void setRepuestoId(Long repuestoId) { this.repuestoId = repuestoId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
