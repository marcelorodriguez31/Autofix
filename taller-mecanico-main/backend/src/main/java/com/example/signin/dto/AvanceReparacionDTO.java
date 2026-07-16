package com.example.signin.dto;

public class AvanceReparacionDTO {

    private String descripcion;
    private Integer porcentajeAvance;
    private String estado;
    private Long ordenTrabajoId;

    public AvanceReparacionDTO() {}

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPorcentajeAvance() { return porcentajeAvance; }
    public void setPorcentajeAvance(Integer porcentajeAvance) { this.porcentajeAvance = porcentajeAvance; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Long getOrdenTrabajoId() { return ordenTrabajoId; }
    public void setOrdenTrabajoId(Long ordenTrabajoId) { this.ordenTrabajoId = ordenTrabajoId; }
}
