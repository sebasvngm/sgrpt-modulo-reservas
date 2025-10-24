package com.sgrpt.modelo;

public class PaqueteTuristico {
    private int idPaquete;
    private String nombre;
    private String descripcion;
    private String destino;
    private int duracionDias;
    private double precio;

    // 1. Constructor Vacío (Requerido por JDBC en algunas operaciones)
    public PaqueteTuristico() {
    }

    // 2. Constructor Completo (Útil para crear el objeto desde la DB)
    public PaqueteTuristico(int idPaquete, String nombre, String descripcion, String destino, int duracionDias, double precio) {
        this.idPaquete = idPaquete;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.destino = destino;
        this.duracionDias = duracionDias;
        this.precio = precio;
    }

    // 3. Constructor sin ID (Útil para insertar un nuevo paquete)
    public PaqueteTuristico(String nombre, String descripcion, String destino, int duracionDias, double precio) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.destino = destino;
        this.duracionDias = duracionDias;
        this.precio = precio;
    }

    // 4. Getters y Setters

    public int getIdPaquete() { return idPaquete; }
    public void setIdPaquete(int idPaquete) { this.idPaquete = idPaquete; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public int getDuracionDias() { return duracionDias; }
    public void setDuracionDias(int duracionDias) { this.duracionDias = duracionDias; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    // 5. Método toString (Para impresión en consola)
    @Override
    public String toString() {
        return "PaqueteTuristico [ID=" + idPaquete + ", Nombre=" + nombre + ", Destino=" + destino + ", Días=" + duracionDias + ", Precio=" + precio + "]";
    }
}