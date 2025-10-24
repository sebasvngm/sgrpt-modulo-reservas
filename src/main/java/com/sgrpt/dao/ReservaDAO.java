package com.sgrpt.dao;

import com.sgrpt.conexion.ConexionDB;
import com.sgrpt.modelo.Reserva;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ReservaDAO {

    // Comandos SQL (compatibles con PostgreSQL)
    private static final String SQL_INSERT = "INSERT INTO Reserva (fechaReserva, estado, idCliente, idPaquete, numPersonas, totalPagar) VALUES (?, ?, ?, ?, ?, ?)";
    private static final String SQL_SELECT_ALL = "SELECT idReserva, fechaReserva, estado, idCliente, idPaquete, numPersonas, totalPagar FROM Reserva";
    private static final String SQL_UPDATE = "UPDATE Reserva SET fechaReserva = ?, estado = ?, idCliente = ?, idPaquete = ?, numPersonas = ?, totalPagar = ? WHERE idReserva = ?";
    private static final String SQL_DELETE = "DELETE FROM Reserva WHERE idReserva = ?";

    /**
     * 1. CREAR: Inserta una nueva reserva.
     */
    public boolean insertar(Reserva reserva) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_INSERT);
            
            // Usamos setDate directamente ya que el modelo usa java.sql.Date
            ps.setDate(1, reserva.getFechaReserva()); 
            ps.setString(2, reserva.getEstado());
            ps.setInt(3, reserva.getIdCliente());
            ps.setInt(4, reserva.getIdPaquete());
            ps.setInt(5, reserva.getNumPersonas());
            ps.setDouble(6, reserva.getTotalPagar());

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al insertar reserva: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }

    /**
     * 2. LEER: Obtiene todas las reservas.
     */
    public List<Reserva> obtenerTodos() {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Reserva> listaReservas = new ArrayList<>();

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_SELECT_ALL);
            rs = ps.executeQuery();

            while (rs.next()) {
                Reserva reserva = new Reserva(
                    rs.getInt("idReserva"),
                    rs.getDate("fechaReserva"), // Obtener como java.sql.Date
                    rs.getString("estado"),
                    rs.getInt("idCliente"),
                    rs.getInt("idPaquete"),
                    rs.getInt("numPersonas"),
                    rs.getDouble("totalPagar")
                );
                listaReservas.add(reserva);
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener todas las reservas: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return listaReservas;
    }
    
    /**
     * 3. ACTUALIZAR: Modifica una reserva existente.
     */
    public boolean actualizar(Reserva reserva) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_UPDATE);
            
            ps.setDate(1, reserva.getFechaReserva());
            ps.setString(2, reserva.getEstado());
            ps.setInt(3, reserva.getIdCliente());
            ps.setInt(4, reserva.getIdPaquete());
            ps.setInt(5, reserva.getNumPersonas());
            ps.setDouble(6, reserva.getTotalPagar());
            ps.setInt(7, reserva.getIdReserva()); // ID para la cláusula WHERE

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al actualizar reserva: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }

    /**
     * 4. ELIMINAR: Elimina una reserva por su ID.
     */
    public boolean eliminar(int idReserva) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_DELETE);
            ps.setInt(1, idReserva);

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al eliminar reserva: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }
}