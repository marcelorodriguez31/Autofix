package com.example.signin.service;

import com.example.signin.dto.RepuestoDTO;
import com.example.signin.model.Repuesto;
import com.example.signin.repository.RepuestoRepository;
import com.example.signin.repository.SolicitudRepuestoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service
public class RepuestoService {

    private final RepuestoRepository repuestoRepository;
    private final SolicitudRepuestoRepository solicitudRepuestoRepository;

    public RepuestoService(
            RepuestoRepository repuestoRepository,
            SolicitudRepuestoRepository solicitudRepuestoRepository
    ) {
        this.repuestoRepository =
                repuestoRepository;

        this.solicitudRepuestoRepository =
                solicitudRepuestoRepository;
    }

    public List<Repuesto> listarRepuestos() {
        return repuestoRepository.findAll();
    }

    public Repuesto obtenerPorId(Long id) {
        return repuestoRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Repuesto no encontrado"
                        )
                );
    }

    public List<Repuesto> obtenerStockBajo(
            Integer limite
    ) {
        if (limite == null || limite < 0) {
            throw new IllegalArgumentException(
                    "El límite de stock no puede ser negativo"
            );
        }

        return repuestoRepository
                .findByStockLessThanEqual(limite);
    }

    /**
     * synchronized evita que dos peticiones dentro de esta
     * aplicación calculen simultáneamente el mismo código.
     *
     * El código se genera únicamente al guardar, por lo que
     * abrir o cancelar el formulario no consume correlativos.
     */
    @Transactional
    public synchronized Repuesto crearRepuesto(
            RepuestoDTO dto
    ) {
        validarDatosRepuesto(dto);

        String nuevoCodigo =
                generarSiguienteCodigo();

        Repuesto repuesto = new Repuesto();

        repuesto.setCodigo(nuevoCodigo);

        repuesto.setNombre(
                dto.getNombre().trim()
        );

        repuesto.setStock(
                dto.getStock()
        );

        repuesto.setPrecioUnitario(
                dto.getPrecioUnitario()
        );

        return repuestoRepository.save(repuesto);
    }

    @Transactional
    public Repuesto actualizarRepuesto(
            Long id,
            RepuestoDTO dto
    ) {
        validarDatosRepuesto(dto);

        Repuesto repuesto =
                repuestoRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repuesto no encontrado"
                                )
                        );

        /*
         * El código no se modifica.
         * Se conserva el código correlativo original.
         */
        repuesto.setNombre(
                dto.getNombre().trim()
        );

        repuesto.setStock(
                dto.getStock()
        );

        repuesto.setPrecioUnitario(
                dto.getPrecioUnitario()
        );

        return repuestoRepository.save(repuesto);
    }

    @Transactional
    public Repuesto aumentarStock(
            Long id,
            Integer cantidad
    ) {
        validarCantidadStock(cantidad);

        Repuesto repuesto =
                repuestoRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repuesto no encontrado"
                                )
                        );

        int stockActual =
                repuesto.getStock() == null
                        ? 0
                        : repuesto.getStock();

        repuesto.setStock(
                stockActual + cantidad
        );

        return repuestoRepository.save(repuesto);
    }

    @Transactional
    public Repuesto disminuirStock(
            Long id,
            Integer cantidad
    ) {
        validarCantidadStock(cantidad);

        Repuesto repuesto =
                repuestoRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repuesto no encontrado"
                                )
                        );

        int stockActual =
                repuesto.getStock() == null
                        ? 0
                        : repuesto.getStock();

        if (stockActual < cantidad) {
            throw new IllegalArgumentException(
                    "Stock insuficiente. Stock disponible: "
                            + stockActual
            );
        }

        repuesto.setStock(
                stockActual - cantidad
        );

        return repuestoRepository.save(repuesto);
    }

    @Transactional
    public Repuesto ajustarStock(
            Long id,
            Integer cantidad
    ) {
        if (cantidad == null) {
            throw new IllegalArgumentException(
                    "La cantidad de stock es obligatoria"
            );
        }

        if (cantidad < 0) {
            throw new IllegalArgumentException(
                    "El stock no puede ser negativo"
            );
        }

        Repuesto repuesto =
                repuestoRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repuesto no encontrado"
                                )
                        );

        repuesto.setStock(cantidad);

        return repuestoRepository.save(repuesto);
    }

    @Transactional
    public void eliminarRepuesto(Long id) {
        Repuesto repuesto =
                repuestoRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repuesto no encontrado"
                                )
                        );

        if (
                solicitudRepuestoRepository
                        .existsByRepuestoId(id)
        ) {
            throw new IllegalStateException(
                    "No se puede eliminar este repuesto porque "
                            + "está siendo utilizado en solicitudes "
                            + "de repuesto. Elimine primero las "
                            + "solicitudes asociadas."
            );
        }

        repuestoRepository.delete(repuesto);
    }

    private String generarSiguienteCodigo() {
        int siguienteNumero = 1;

        Repuesto ultimoRepuesto =
                repuestoRepository
                        .findTopByOrderByIdDesc()
                        .orElse(null);

        if (
                ultimoRepuesto != null
                && ultimoRepuesto.getCodigo() != null
        ) {
            siguienteNumero =
                    extraerNumeroCodigo(
                            ultimoRepuesto.getCodigo()
                    ) + 1;
        }

        String codigo = formatearCodigo(
                siguienteNumero
        );

        /*
         * Protección adicional por si existen códigos
         * antiguos, importados o registros eliminados.
         */
        while (
                repuestoRepository
                        .existsByCodigo(codigo)
        ) {
            siguienteNumero++;
            codigo = formatearCodigo(
                    siguienteNumero
            );
        }

        return codigo;
    }

    private int extraerNumeroCodigo(
            String codigo
    ) {
        if (codigo == null || codigo.isBlank()) {
            return 0;
        }

        String numeros =
                codigo.replaceAll("\\D", "");

        if (numeros.isBlank()) {
            return 0;
        }

        try {
            return Integer.parseInt(numeros);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private String formatearCodigo(
            int numero
    ) {
        return String.format(
                "REP-%03d",
                numero
        );
    }

    private void validarDatosRepuesto(
            RepuestoDTO dto
    ) {
        if (dto == null) {
            throw new IllegalArgumentException(
                    "Los datos del repuesto son obligatorios"
            );
        }

        if (
                dto.getNombre() == null
                || dto.getNombre().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El nombre del repuesto es obligatorio"
            );
        }

        if (dto.getStock() == null) {
            throw new IllegalArgumentException(
                    "El stock inicial es obligatorio"
            );
        }

        if (dto.getStock() < 0) {
            throw new IllegalArgumentException(
                    "El stock no puede ser negativo"
            );
        }

        if (dto.getPrecioUnitario() == null) {
            throw new IllegalArgumentException(
                    "El precio unitario es obligatorio"
            );
        }

        if (dto.getPrecioUnitario() < 0) {
            throw new IllegalArgumentException(
                    "El precio unitario no puede ser negativo"
            );
        }
    }

    private void validarCantidadStock(
            Integer cantidad
    ) {
        if (cantidad == null) {
            throw new IllegalArgumentException(
                    "La cantidad es obligatoria"
            );
        }

        if (cantidad <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero"
            );
        }
    }
}