// Archivo: src/main/java/com/sgrpt/conexion/ConexionDB.java

package com.sgrpt.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {

    // Cambios: URL de PostgreSQL, Puerto 5432, Usuario 'postgres'
    private static final String URL = "jdbc:postgresql://localhost:5432/sgrpt_postgresql_db";
    private static final String USUARIO = "postgres"; // Usuario por defecto de Postgre
    private static final String CLAVE = "Svmoncada"; // ¡ADVERTENCIA: Cambia tu clave!

    /**
     * Establece la conexión con la base de datos PostgreSQL.
     */
    public static Connection obtenerConexion() {
        Connection conexion = null; 
        try {
            // El driver de PostgreSQL se carga automáticamente en JDBC 4.0+
            conexion = DriverManager.getConnection(URL, USUARIO, CLAVE);
            // System.out.println("Conexión exitosa a PostgreSQL."); 

        } catch (SQLException e) {
            System.err.println("Error de conexión a PostgreSQL. Revisa el puerto (5432) y la clave.");
            e.printStackTrace();
        }
        return conexion;
    }
    
    /**
     * Cierra la conexión a la base de datos.
     */
    public static void cerrarConexion(Connection conexion) {
        if (conexion != null) {
            try {
                conexion.close();
            } catch (SQLException e) {
                System.err.println("Error al cerrar la conexión: " + e.getMessage());
            }
        }
    }
}
