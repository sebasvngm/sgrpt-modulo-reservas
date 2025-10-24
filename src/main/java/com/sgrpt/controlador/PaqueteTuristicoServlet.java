package com.sgrpt.controlador;

import com.sgrpt.dao.PaqueteTuristicoDAO;
import com.sgrpt.modelo.PaqueteTuristico;

import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.sql.SQLException;

// Mapeamos el servlet para que responda a la URL /Paquetes
@WebServlet("/Paquetes")
public class PaqueteTuristicoServlet extends HttpServlet {

    private PaqueteTuristicoDAO paqueteDAO;

    public void init() {
        // Inicializa el DAO al cargar el servlet
        paqueteDAO = new PaqueteTuristicoDAO();
    }

    /**
     * Maneja las peticiones GET: Muestra la lista, el formulario de creación, o el formulario de edición.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException 
    {
        String action = request.getParameter("action");
        if (action == null) {
            action = "listar"; // Acción por defecto
        }

        try {
            switch (action) {
                case "nuevo":
                    mostrarFormularioNuevo(request, response);
                    break;
                case "editar":
                    mostrarFormularioEditar(request, response);
                    break;
                case "eliminar":
                    eliminarPaquete(request, response);
                    break;
                case "listar":
                default:
                    listarPaquetes(request, response);
                    break;
            }
        } catch (SQLException ex) {
            throw new ServletException(ex);
        }
    }

    /**
     * Maneja las peticiones POST: Guarda (crea/actualiza) el paquete.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException 
    {
        // La acción POST siempre es guardar (crear o actualizar)
        try {
            insertarOActualizarPaquete(request, response);
        } catch (SQLException ex) {
            throw new ServletException(ex);
        }
    }

    // --- Métodos de Lógica GET (Visualización) ---

    private void listarPaquetes(HttpServletRequest request, HttpServletResponse response) 
        throws SQLException, IOException, ServletException 
    {
        List<PaqueteTuristico> listaPaquetes = paqueteDAO.obtenerTodos();
        request.setAttribute("listaPaquetes", listaPaquetes);
        
        // Redirige a la vista JSP
        RequestDispatcher dispatcher = request.getRequestDispatcher("vistas/PaqueteListado.jsp");
        dispatcher.forward(request, response);
    }

    private void mostrarFormularioNuevo(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException 
    {
        RequestDispatcher dispatcher = request.getRequestDispatcher("vistas/PaqueteFormulario.jsp");
        dispatcher.forward(request, response);
    }

    private void mostrarFormularioEditar(HttpServletRequest request, HttpServletResponse response) 
        throws SQLException, ServletException, IOException 
    {
        int id = Integer.parseInt(request.getParameter("id"));
        PaqueteTuristico paqueteExistente = paqueteDAO.obtenerPorId(id);
        
        request.setAttribute("paquete", paqueteExistente);
        
        RequestDispatcher dispatcher = request.getRequestDispatcher("vistas/PaqueteFormulario.jsp");
        dispatcher.forward(request, response);
    }

    // --- Métodos de Lógica POST (Acciones CRUD) ---

    private void insertarOActualizarPaquete(HttpServletRequest request, HttpServletResponse response) 
        throws SQLException, IOException 
    {
        // Leer parámetros del formulario
        String idParam = request.getParameter("idPaquete");
        String nombre = request.getParameter("nombre");
        String descripcion = request.getParameter("descripcion");
        String destino = request.getParameter("destino");
        int duracionDias = Integer.parseInt(request.getParameter("duracionDias"));
        double precio = Double.parseDouble(request.getParameter("precio"));
        
        PaqueteTuristico paquete;

        if (idParam != null && !idParam.isEmpty()) {
            // Es una ACTUALIZACIÓN
            int id = Integer.parseInt(idParam);
            paquete = new PaqueteTuristico(id, nombre, descripcion, destino, duracionDias, precio);
            paqueteDAO.actualizar(paquete);
        } else {
            // Es una INSERCIÓN
            paquete = new PaqueteTuristico(nombre, descripcion, destino, duracionDias, precio);
            paqueteDAO.insertar(paquete);
        }

        // Redirige al listado después de la acción
        response.sendRedirect("Paquetes?action=listar");
    }

    private void eliminarPaquete(HttpServletRequest request, HttpServletResponse response) 
        throws SQLException, IOException 
    {
        int id = Integer.parseInt(request.getParameter("id"));
        paqueteDAO.eliminar(id);
        
        // Redirige al listado
        response.sendRedirect("Paquetes?action=listar");
    }
}