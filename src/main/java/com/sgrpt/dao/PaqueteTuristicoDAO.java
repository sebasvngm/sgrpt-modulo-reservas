package com.sgrpt.dao;

import com.sgrpt.conexion.ConexionDB;
import com.sgrpt.modelo.PaqueteTuristico;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PaqueteTuristicoDAO {

    // Comandos SQL (compatibles con PostgreSQL)
    private static final String SQL_INSERT = "INSERT INTO PaquetesTuristico (nombre, descripcion, destino, duracionDias, precio) VALUES (?, ?, ?, ?, ?)";
    private static final String SQL_SELECT_ALL = "SELECT idPaquete, nombre, descripcion, destino, duracionDias, precio FROM PaquetesTuristico";
    private static final String SQL_SELECT_BY_ID = "SELECT idPaquete, nombre, descripcion, destino, duracionDias, precio FROM PaquetesTuristico WHERE idPaquete = ?";
    private static final String SQL_UPDATE = "UPDATE PaquetesTuristico SET nombre = ?, descripcion = ?, destino = ?, duracionDias = ?, precio = ? WHERE idPaquete = ?";
    private static final String SQL_DELETE = "DELETE FROM PaquetesTuristico WHERE idPaquete = ?";

    /**
     * 1. CREAR: Inserta un nuevo paquete turístico en la base de datos.
     */
    public boolean insertar(PaqueteTuristico paquete) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_INSERT);
            
            ps.setString(1, paquete.getNombre());
            ps.setString(2, paquete.getDescripcion());
            ps.setString(3, paquete.getDestino());
            ps.setInt(4, paquete.getDuracionDias());
            ps.setDouble(5, paquete.getPrecio());

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al insertar paquete turístico: " + e.getMessage());
        } finally {
            // Se asume que ConexionDB tiene un método para cerrar recursos
            ConexionDB.cerrarConexion(conn); 
        }
        return exito;
    }

    /**
     * 2. LEER: Obtiene todos los paquetes turísticos.
     */
    public List<PaqueteTuristico> obtenerTodos() {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<PaqueteTuristico> listaPaquetes = new ArrayList<>();

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_SELECT_ALL);
            rs = ps.executeQuery();

            while (rs.next()) {
                PaqueteTuristico paquete = new PaqueteTuristico(
                    rs.getInt("idPaquete"),
                    rs.getString("nombre"),
                    rs.getString("descripcion"),
                    rs.getString("destino"),
                    rs.getInt("duracionDias"),
                    rs.getDouble("precio")
                );
                listaPaquetes.add(paquete);
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener todos los paquetes: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn); // Cerrar solo la conexión (idealmente se cierran PS y RS también)
        }
        return listaPaquetes;
    }
    
    // El método obtenerPorId y actualizar/eliminar sigue la misma estructura

    /**
     * 3. ACTUALIZAR: Modifica un paquete existente.
     */
    public boolean actualizar(PaqueteTuristico paquete) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_UPDATE);
            
            ps.setString(1, paquete.getNombre());
            ps.setString(2, paquete.getDescripcion());
            ps.setString(3, paquete.getDestino());
            ps.setInt(4, paquete.getDuracionDias());
            ps.setDouble(5, paquete.getPrecio());
            ps.setInt(6, paquete.getIdPaquete()); // ID para la cláusula WHERE

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al actualizar paquete: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }

    /**
     * 4. ELIMINAR: Elimina un paquete por su ID.
     */
    public boolean eliminar(int idPaquete) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_DELETE);
            ps.setInt(1, idPaquete);

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al eliminar paquete: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }
}