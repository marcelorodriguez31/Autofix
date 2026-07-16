package com.example.signin.dto;

import java.time.LocalDateTime;

public class HistorialMantencionDTO {

    private Long ordenId;
    private String numeroOrden;
    private LocalDateTime fechaIngreso;
    private String estadoOrden;
    private String diagnosticoPreliminar;

    private Integer vehiculoId;
    private String patente;
    private String marca;
    private String modelo;

    private Integer clienteId;
    private String nombreCliente;
    private String rutCliente;

    private String mecanicoNombre;
    private String mecanicoEspecialidad;

    private String fallas;
    private String observaciones;
    private String recomendaciones;

    private Double montoPresupuesto;
    private String estadoPresupuesto;

    private String tipoDocumento;
    private Double montoPagado;

    public HistorialMantencionDTO() {}

    public Long getOrdenId() { return ordenId; }
    public void setOrdenId(Long ordenId) { this.ordenId = ordenId; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDateTime fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public String getEstadoOrden() { return estadoOrden; }
    public void setEstadoOrden(String estadoOrden) { this.estadoOrden = estadoOrden; }

    public String getDiagnosticoPreliminar() { return diagnosticoPreliminar; }
    public void setDiagnosticoPreliminar(String diagnosticoPreliminar) { this.diagnosticoPreliminar = diagnosticoPreliminar; }

    public Integer getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Integer vehiculoId) { this.vehiculoId = vehiculoId; }

    public String getPatente() { return patente; }
    public void setPatente(String patente) { this.patente = patente; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getRutCliente() { return rutCliente; }
    public void setRutCliente(String rutCliente) { this.rutCliente = rutCliente; }

    public String getMecanicoNombre() { return mecanicoNombre; }
    public void setMecanicoNombre(String mecanicoNombre) { this.mecanicoNombre = mecanicoNombre; }

    public String getMecanicoEspecialidad() { return mecanicoEspecialidad; }
    public void setMecanicoEspecialidad(String mecanicoEspecialidad) { this.mecanicoEspecialidad = mecanicoEspecialidad; }

    public String getFallas() { return fallas; }
    public void setFallas(String fallas) { this.fallas = fallas; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getRecomendaciones() { return recomendaciones; }
    public void setRecomendaciones(String recomendaciones) { this.recomendaciones = recomendaciones; }

    public Double getMontoPresupuesto() { return montoPresupuesto; }
    public void setMontoPresupuesto(Double montoPresupuesto) { this.montoPresupuesto = montoPresupuesto; }

    public String getEstadoPresupuesto() { return estadoPresupuesto; }
    public void setEstadoPresupuesto(String estadoPresupuesto) { this.estadoPresupuesto = estadoPresupuesto; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public Double getMontoPagado() { return montoPagado; }
    public void setMontoPagado(Double montoPagado) { this.montoPagado = montoPagado; }
}
