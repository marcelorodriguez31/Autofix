package com.example.signin.dto;

public class VehiculoDTO {
    private Integer id;
    private Integer clienteId;
    private String patente;
    private String marca;
    private String modelo;
    private Integer anio;
    private Integer kilometraje;

    public VehiculoDTO() {}

    public VehiculoDTO(Integer id, Integer clienteId, String patente, String marca, String modelo, Integer anio, Integer kilometraje) {
        this.id = id;
        this.clienteId = clienteId;
        this.patente = patente;
        this.marca = marca;
        this.modelo = modelo;
        this.anio = anio;
        this.kilometraje = kilometraje;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public String getPatente() { return patente; }
    public void setPatente(String patente) { this.patente = patente; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public Integer getKilometraje() { return kilometraje; }
    public void setKilometraje(Integer kilometraje) { this.kilometraje = kilometraje; }
}

