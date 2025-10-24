package com.sgrpt.modelo;

public class Cliente {
    private int idCliente;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String identificacion;

    // 1. Constructor Vacío
    public Cliente() {
    }

    // 2. Constructor Completo
    public Cliente(int idCliente, String nombre, String apellido, String email, String telefono, String identificacion) {
        this.idCliente = idCliente;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.identificacion = identificacion;
    }

    // 3. Constructor sin ID (Para insertar)
    public Cliente(String nombre, String apellido, String email, String telefono, String identificacion) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.identificacion = identificacion;
    }

    // 4. Getters y Setters

    public int getIdCliente() { return idCliente; }
    public void setIdCliente(int idCliente) { this.idCliente = idCliente; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getIdentificacion() { return identificacion; }
    public void setIdentificacion(String identificacion) { this.identificacion = identificacion; }

    // 5. Método toString
    @Override
    public String toString() {
        return "Cliente [ID=" + idCliente + ", Nombre=" + nombre + " " + apellido + ", Email=" + email + ", Identificación=" + identificacion + "]";
    }
}