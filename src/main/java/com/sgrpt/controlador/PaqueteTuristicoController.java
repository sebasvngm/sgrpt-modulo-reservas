package com.sgrpt.controlador;

import com.sgrpt.modelo.PaqueteTuristico;
import com.sgrpt.repositorio.PaqueteTuristicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// [Comentario]: @RestController combina @Controller y @ResponseBody (devuelve datos JSON/XML).
@RestController 
// [Comentario]: Mapea todas las URLs de esta clase a /api/v1/paquetes
@RequestMapping("/api/v1/paquetes") 
public class PaqueteTuristicoController {

    // [Comentario]: Inyección de dependencia. Spring proporciona la instancia del Repositorio.
    @Autowired
    private PaqueteTuristicoRepository repositorio;

    // --- 1. LEER TODOS (GET) ---
    // [Comentario]: Mapea a GET /api/v1/paquetes
    @GetMapping
    public List<PaqueteTuristico> obtenerTodos() {
        return repositorio.findAll(); // [Comentario]: Método provisto por JpaRepository
    }

    // --- 2. LEER POR ID (GET) ---
    // [Comentario]: Mapea a GET /api/v1/paquetes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PaqueteTuristico> obtenerPorId(@PathVariable Integer id) {
        // [Comentario]: Optional<T> maneja si el resultado existe o no.
        Optional<PaqueteTuristico> paquete = repositorio.findById(id); 

        // [Comentario]: Si existe, devuelve 200 OK con el paquete. Si no, devuelve 404 NOT FOUND.
        return paquete.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- 3. CREAR (POST) ---
    // [Comentario]: Mapea a POST /api/v1/paquetes
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // [Comentario]: Devuelve código HTTP 201 (Creado)
    // [Comentario]: @RequestBody mapea el JSON de la petición al objeto PaqueteTuristico
    public PaqueteTuristico crearPaquete(@RequestBody PaqueteTuristico paquete) {
        return repositorio.save(paquete);
    }

    // --- 4. ACTUALIZAR (PUT) ---
    // [Comentario]: Mapea a PUT /api/v1/paquetes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PaqueteTuristico> actualizarPaquete(@PathVariable Integer id, @RequestBody PaqueteTuristico detallesPaquete) {
        
        return repositorio.findById(id)
            .map(paquete -> {
                // [Comentario]: Actualiza los campos del objeto existente
                paquete.setNombre(detallesPaquete.getNombre());
                paquete.setDestino(detallesPaquete.getDestino());
                paquete.setPrecio(detallesPaquete.getPrecio());
                
                PaqueteTuristico actualizado = repositorio.save(paquete); // [Comentario]: Guarda el objeto actualizado
                return ResponseEntity.ok(actualizado);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- 5. ELIMINAR (DELETE) ---
    // [Comentario]: Mapea a DELETE /api/v1/paquetes/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // [Comentario]: Devuelve código HTTP 204 (Éxito sin contenido)
    public void eliminarPaquete(@PathVariable Integer id) {
        repositorio.deleteById(id); // [Comentario]: Método provisto por JpaRepository
    }
}