package com.example.signin.dto;

public class ClienteDTO {
    private Integer id;
    private String rut;
    private String nombre;
    private String telefono;
    private String email;
    private String direccion;

    public ClienteDTO() {}

    public ClienteDTO(Integer id, String rut, String nombre, String telefono, String email, String direccion) {
        this.id = id;
        this.rut = rut;
        this.nombre = nombre;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRut() { return rut; }
    public void setRut(String rut) { this.rut = rut; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}

