package com.sgrpt.modelo;

import java.sql.Date; // Usaremos java.sql.Date para compatibilidad directa con JDBC

public class Reserva {
    private int idReserva;
    private Date fechaReserva;
    private String estado; // Ej: 'Confirmada', 'Pendiente', 'Cancelada'
    private int idCliente; // Clave foránea al Cliente
    private int idPaquete; // Clave foránea al PaqueteTuristico
    private int numPersonas;
    private double totalPagar;

    // 1. Constructor Vacío
    public Reserva() {
    }

    // 2. Constructor Completo
    public Reserva(int idReserva, Date fechaReserva, String estado, int idCliente, int idPaquete, int numPersonas, double totalPagar) {
        this.idReserva = idReserva;
        this.fechaReserva = fechaReserva;
        this.estado = estado;
        this.idCliente = idCliente;
        this.idPaquete = idPaquete;
        this.numPersonas = numPersonas;
        this.totalPagar = totalPagar;
    }

    // 3. Constructor sin ID (Para insertar)
    public Reserva(Date fechaReserva, String estado, int idCliente, int idPaquete, int numPersonas, double totalPagar) {
        this.fechaReserva = fechaReserva;
        this.estado = estado;
        this.idCliente = idCliente;
        this.idPaquete = idPaquete;
        this.numPersonas = numPersonas;
        this.totalPagar = totalPagar;
    }

    // 4. Getters y Setters

    public int getIdReserva() { return idReserva; }
    public void setIdReserva(int idReserva) { this.idReserva = idReserva; }

    public Date getFechaReserva() { return fechaReserva; }
    public void setFechaReserva(Date fechaReserva) { this.fechaReserva = fechaReserva; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public int getIdCliente() { return idCliente; }
    public void setIdCliente(int idCliente) { this.idCliente = idCliente; }

    public int getIdPaquete() { return idPaquete; }
    public void setIdPaquete(int idPaquete) { this.idPaquete = idPaquete; }

    public int getNumPersonas() { return numPersonas; }
    public void setNumPersonas(int numPersonas) { this.numPersonas = numPersonas; }

    public double getTotalPagar() { return totalPagar; }
    public void setTotalPagar(double totalPagar) { this.totalPagar = totalPagar; }

    // 5. Método toString
    @Override
    public String toString() {
        return "Reserva [ID=" + idReserva + ", Fecha=" + fechaReserva + ", ClienteID=" + idCliente + ", PaqueteID=" + idPaquete + ", Estado=" + estado + ", Total=" + totalPagar + "]";
    }
}