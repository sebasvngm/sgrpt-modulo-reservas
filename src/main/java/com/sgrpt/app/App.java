package com.sgrpt.app;

import com.sgrpt.conexion.ConexionDB;
import java.sql.Connection;

/**
 * Clase principal para probar la conexión a PostgreSQL.
 */
public class App {
    
    public static void main(String[] args) {
        System.out.println("--- SGRPT: Módulo de Reservas ---");
        
        // 1. Obtener la conexión a la base de datos PostgreSQL
        Connection conexion = ConexionDB.obtenerConexion();
        
        // 2. Verificar el estado de la conexión
        if (conexion != null) {
            System.out.println("🎉 Éxito: La conexión con PostgreSQL ha sido establecida correctamente.");
            System.out.println("El proyecto está listo para iniciar las operaciones DAO (CRUD).");
        } else {
            System.err.println("❌ Error: No se pudo establecer la conexión con PostgreSQL.");
            System.err.println("Revisa: 1) Contraseña/Usuario en ConexionDB.java 2) El servicio de PostgreSQL (puerto 5432) esté activo.");
        }
        
        // 3. Cerrar la conexión (si se abrió)
        ConexionDB.cerrarConexion(conexion);
    }
}