package com.sgrpt.modelo;

import jakarta.persistence.*; // Usa 'jakarta' si usas Spring Boot 3+ (versión en pom.xml)
// Si usas una versión anterior de Spring Boot, usa 'javax.persistence.*'

// [Comentario]: @Entity indica que esta clase es una tabla en la base de datos.
@Entity 
@Table(name = "paquesturistico") // [Comentario]: Opcional, nombre de la tabla
public class PaqueteTuristico {
    
    // [Comentario]: @Id marca la clave primaria de la tabla.
    @Id 
    // [Comentario]: Generación de ID automática (IDENTITY es común para PostgreSQL/MySQL).
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Integer idPaquete;

    private String nombre;
    private String descripcion;
    private String destino;
    private Integer duracionDias;
    private Double precio;

    // [Comentario]: Constructor vacío requerido por JPA.
    public PaqueteTuristico() {}

    // [Comentario]: Constructor con todos los campos.
    public PaqueteTuristico(Integer idPaquete, String nombre, String descripcion, String destino, Integer duracionDias, Double precio) {
        this.idPaquete = idPaquete;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.destino = destino;
        this.duracionDias = duracionDias;
        this.precio = precio;
    }
    
    // [Comentario]: Getters y Setters para que Spring pueda leer/escribir los atributos.
    
    public Integer getIdPaquete() { return idPaquete; }
    public void setIdPaquete(Integer idPaquete) { this.idPaquete = idPaquete; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }
    
    public Integer getDuracionDias() { return duracionDias; }
    public void setDuracionDias(Integer duracionDias) { this.duracionDias = duracionDias; }
    
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
}