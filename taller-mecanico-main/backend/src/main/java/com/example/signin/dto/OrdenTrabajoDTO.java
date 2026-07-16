package com.example.signin.dto;

public class OrdenTrabajoDTO {

    private String estado;
    private String diagnosticoPreliminar;
    private Integer vehiculoId;
    private Integer mecanicoId;

    public OrdenTrabajoDTO() {}

    public String getEstado() { return estado; }
    public String getDiagnosticoPreliminar() { return diagnosticoPreliminar; }
    public Integer getVehiculoId() { return vehiculoId; }
    public Integer getMecanicoId() { return mecanicoId; }

    public void setEstado(String estado) { this.estado = estado; }
    public void setDiagnosticoPreliminar(String diagnosticoPreliminar) { this.diagnosticoPreliminar = diagnosticoPreliminar; }
    public void setVehiculoId(Integer vehiculoId) { this.vehiculoId = vehiculoId; }
    public void setMecanicoId(Integer mecanicoId) { this.mecanicoId = mecanicoId; }
}