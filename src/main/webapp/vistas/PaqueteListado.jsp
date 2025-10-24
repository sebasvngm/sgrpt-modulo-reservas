<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SGRPT - Listado de Paquetes</title>
</head>
<body>
    <h1>Listado de Paquetes Turísticos</h1>

    <p><a href="Paquetes?action=nuevo">Crear Nuevo Paquete</a></p>

    <table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Destino</th>
                <th>Duración (Días)</th>
                <th>Precio</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <c:forEach var="paquete" items="${listaPaquetes}">
                <tr>
                    <td><c:out value="${paquete.idPaquete}" /></td>
                    <td><c:out value="${paquete.nombre}" /></td>
                    <td><c:out value="${paquete.destino}" /></td>
                    <td><c:out value="${paquete.duracionDias}" /></td>
                    <td><c:out value="${paquete.precio}" /></td>
                    <td>
                        <a href="Paquetes?action=editar&id=<c:out value='${paquete.idPaquete}' />">Editar</a>
                        &nbsp;&nbsp;&nbsp;
                        <a href="Paquetes?action=eliminar&id=<c:out value='${paquete.idPaquete}' />" 
                           onclick="return confirm('¿Está seguro de eliminar este paquete?');">Eliminar</a>
                    </td>
                </tr>
            </c:forEach>
        </tbody>
    </table>
    
    <c:if test="${empty listaPaquetes}">
        <p>No hay paquetes turísticos registrados.</p>
    </c:if>

</body>
</html>