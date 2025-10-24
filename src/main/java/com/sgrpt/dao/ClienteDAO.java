package com.sgrpt.dao;

import com.sgrpt.conexion.ConexionDB;
import com.sgrpt.modelo.Cliente;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ClienteDAO {

    // Comandos SQL (compatibles con PostgreSQL)
    private static final String SQL_INSERT = "INSERT INTO Cliente (nombre, apellido, email, telefono, identificacion) VALUES (?, ?, ?, ?, ?)";
    private static final String SQL_SELECT_ALL = "SELECT idCliente, nombre, apellido, email, telefono, identificacion FROM Cliente";
    private static final String SQL_UPDATE = "UPDATE Cliente SET nombre = ?, apellido = ?, email = ?, telefono = ?, identificacion = ? WHERE idCliente = ?";
    private static final String SQL_DELETE = "DELETE FROM Cliente WHERE idCliente = ?";

    /**
     * 1. CREAR: Inserta un nuevo cliente.
     */
    public boolean insertar(Cliente cliente) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_INSERT);
            
            ps.setString(1, cliente.getNombre());
            ps.setString(2, cliente.getApellido());
            ps.setString(3, cliente.getEmail());
            ps.setString(4, cliente.getTelefono());
            ps.setString(5, cliente.getIdentificacion());

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al insertar cliente: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }

    /**
     * 2. LEER: Obtiene todos los clientes.
     */
    public List<Cliente> obtenerTodos() {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Cliente> listaClientes = new ArrayList<>();

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_SELECT_ALL);
            rs = ps.executeQuery();

            while (rs.next()) {
                Cliente cliente = new Cliente(
                    rs.getInt("idCliente"),
                    rs.getString("nombre"),
                    rs.getString("apellido"),
                    rs.getString("email"),
                    rs.getString("telefono"),
                    rs.getString("identificacion")
                );
                listaClientes.add(cliente);
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener todos los clientes: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return listaClientes;
    }
    
    /**
     * 3. ACTUALIZAR: Modifica un cliente existente.
     */
    public boolean actualizar(Cliente cliente) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_UPDATE);
            
            ps.setString(1, cliente.getNombre());
            ps.setString(2, cliente.getApellido());
            ps.setString(3, cliente.getEmail());
            ps.setString(4, cliente.getTelefono());
            ps.setString(5, cliente.getIdentificacion());
            ps.setInt(6, cliente.getIdCliente()); // ID para la cláusula WHERE

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al actualizar cliente: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }

    /**
     * 4. ELIMINAR: Elimina un cliente por su ID.
     */
    public boolean eliminar(int idCliente) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean exito = false;

        try {
            conn = ConexionDB.obtenerConexion();
            ps = conn.prepareStatement(SQL_DELETE);
            ps.setInt(1, idCliente);

            if (ps.executeUpdate() > 0) {
                exito = true;
            }
        } catch (SQLException e) {
            System.err.println("Error al eliminar cliente: " + e.getMessage());
        } finally {
            ConexionDB.cerrarConexion(conn);
        }
        return exito;
    }
}