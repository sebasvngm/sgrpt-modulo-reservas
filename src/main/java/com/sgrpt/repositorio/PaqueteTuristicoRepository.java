package com.sgrpt.repositorio;

import com.sgrpt.modelo.PaqueteTuristico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// [Comentario]: @Repository marca esta interfaz como un componente de acceso a datos de Spring.
@Repository
// [Comentario]: Heredar de JpaRepository proporciona: save(), findAll(), findById(), delete(), etc.
//               <TipoDeEntidad, TipoDeClavePrimaria>
public interface PaqueteTuristicoRepository extends JpaRepository<PaqueteTuristico, Integer> {
    
    // [Comentario]: No se necesita código aquí para el CRUD básico. ¡Es la magia de Spring Data!
}