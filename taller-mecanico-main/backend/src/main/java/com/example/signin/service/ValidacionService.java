package com.example.signin.service;

import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class ValidacionService {

    private static final Pattern TELEFONO_CHILENO =
            Pattern.compile("^\\+569\\d{8}$");

    private static final Pattern PARTE_NOMBRE =
            Pattern.compile("^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'-]{2,}$");

    private static final Pattern EMAIL_VALIDO =
        Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public String normalizarRut(String rut) {
        if (rut == null) {
            return "";
        }

        return rut
                .replace(".", "")
                .replace("-", "")
                .replace(" ", "")
                .toUpperCase(Locale.ROOT);
    }

    public boolean esEmailValido(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }

        return EMAIL_VALIDO.matcher(email.trim()).matches();
    }
    
    public boolean esRutValido(String rut) {
        String rutLimpio = normalizarRut(rut);

        if (!rutLimpio.matches("^\\d{7,8}[0-9K]$")) {
            return false;
        }

        String cuerpo = rutLimpio.substring(0, rutLimpio.length() - 1);
        char digitoIngresado = rutLimpio.charAt(rutLimpio.length() - 1);

        int suma = 0;
        int multiplicador = 2;

        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i))
                    * multiplicador;

            multiplicador = multiplicador == 7
                    ? 2
                    : multiplicador + 1;
        }

        int resultado = 11 - (suma % 11);

        char digitoCalculado;

        if (resultado == 11) {
            digitoCalculado = '0';
        } else if (resultado == 10) {
            digitoCalculado = 'K';
        } else {
            digitoCalculado = Character.forDigit(resultado, 10);
        }

        return digitoIngresado == digitoCalculado;
    }

    public String formatearRut(String rut) {
        String rutLimpio = normalizarRut(rut);

        if (rutLimpio.length() < 2) {
            return rutLimpio;
        }

        String cuerpo = rutLimpio.substring(
                0,
                rutLimpio.length() - 1
        );

        String digito = rutLimpio.substring(
                rutLimpio.length() - 1
        );

        StringBuilder formateado = new StringBuilder();
        int contador = 0;

        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            formateado.insert(0, cuerpo.charAt(i));
            contador++;

            if (contador == 3 && i > 0) {
                formateado.insert(0, ".");
                contador = 0;
            }
        }

        return formateado + "-" + digito;
    }

    public boolean esNombreCompletoValido(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            return false;
        }

        String[] partes = nombre
                .trim()
                .replaceAll("\\s+", " ")
                .split(" ");

        if (partes.length < 2) {
            return false;
        }

        for (String parte : partes) {
            if (!PARTE_NOMBRE.matcher(parte).matches()) {
                return false;
            }
        }

        return true;
    }

    public boolean esTelefonoChilenoValido(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            return true;
        }

        return TELEFONO_CHILENO
                .matcher(telefono.trim())
                .matches();
    }
}