<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><c:out value="${paquete != null ? 'Editar' : 'Nuevo'}" /> Paquete Turístico</title>
</head>
<body>
    <h1>Módulo de Paquetes Turísticos</h1>
    
    <h2><c:out value="${paquete != null ? 'Editar Paquete' : 'Crear Nuevo Paquete'}" /></h2>

    <form action="Paquetes" method="post">
        
        <c:if test="${paquete != null}">
            <input type="hidden" name="idPaquete" value="<c:out value='${paquete.idPaquete}' />" />
        </c:if>

        <label for="nombre">Nombre:</label><br>
        <input type="text" id="nombre" name="nombre" 
               value="<c:out value='${paquete.nombre}' />" required><br><br>

        <label for="descripcion">Descripción:</label><br>
        <textarea id="descripcion" name="descripcion" rows="4" cols="50"><c:out value="${paquete.descripcion}" /></textarea><br><br>

        <label for="destino">Destino:</label><br>
        <input type="text" id="destino" name="destino" 
               value="<c:out value='${paquete.destino}' />" required><br><br>

        <label for="duracionDias">Duración (Días):</label><br>
        <input type="number" id="duracionDias" name="duracionDias" 
               value="<c:out value='${paquete.duracionDias}' />" required><br><br>

        <label for="precio">Precio:</label><br>
        <input type="number" step="0.01" id="precio" name="precio" 
               value="<c:out value='${paquete.precio}' />" required><br><br>

        <input type="submit" value="Guardar Paquete">
    </form>
    
    <p><a href="Paquetes?action=listar">Volver al Listado</a></p>
</body>
</html>