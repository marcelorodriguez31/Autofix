package com.example.signin.dto;

public class DocumentoPagoDTO {

    private Long presupuestoId;
    private String tipoDocumento;

    public DocumentoPagoDTO() {}

    public Long getPresupuestoId() { return presupuestoId; }
    public void setPresupuestoId(Long presupuestoId) { this.presupuestoId = presupuestoId; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }
}
