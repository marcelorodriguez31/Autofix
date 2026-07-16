package com.example.signin.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud_repuesto")
public class SolicitudRepuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(
            name = "fecha_solicitud",
            nullable = false,
            updatable = false
    )
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    @ManyToOne
    @JoinColumn(
            name = "orden_trabajo_id",
            nullable = false
    )
    @JsonIgnoreProperties({
            "vehiculo",
            "mecanico"
    })
    private OrdenTrabajo ordenTrabajo;

    @ManyToOne
    @JoinColumn(
            name = "repuesto_id",
            nullable = false
    )
    private Repuesto repuesto;

    @PrePersist
    protected void onCreate() {
        this.fechaSolicitud =
                LocalDateTime.now();

        if (
                this.estado == null
                || this.estado.isBlank()
        ) {
            this.estado = "PENDIENTE";
        }
    }

    public SolicitudRepuesto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(
            Integer cantidad
    ) {
        this.cantidad = cantidad;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(
            String estado
    ) {
        this.estado = estado;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(
            LocalDateTime fechaSolicitud
    ) {
        this.fechaSolicitud =
                fechaSolicitud;
    }

    public LocalDateTime getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(
            LocalDateTime fechaRecepcion
    ) {
        this.fechaRecepcion =
                fechaRecepcion;
    }

    public OrdenTrabajo getOrdenTrabajo() {
        return ordenTrabajo;
    }

    public void setOrdenTrabajo(
            OrdenTrabajo ordenTrabajo
    ) {
        this.ordenTrabajo =
                ordenTrabajo;
    }

    public Repuesto getRepuesto() {
        return repuesto;
    }

    public void setRepuesto(
            Repuesto repuesto
    ) {
        this.repuesto = repuesto;
    }
}