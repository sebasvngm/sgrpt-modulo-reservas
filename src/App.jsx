import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, setLogLevel, getDocs } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---

// Configuración de respaldo (DUMMY) para el desarrollo local.
const DUMMY_FIREBASE_CONFIG = {
  apiKey: "dummy-api-key", 
  authDomain: "dummy-project.firebaseapp.com",
  projectId: "sgrpt-default-project",
  storageBucket: "dummy-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:dummy",
};

// Variables globales proporcionadas por el entorno de Canvas (o fallbacks)
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.replace(/[./#$\[\]]/g, '_');

// Lógica de carga de configuración
const firebaseConfig = typeof __firebase_config !== 'undefined' && Object.keys(JSON.parse(__firebase_config)).length > 0
  ? JSON.parse(__firebase_config)
  : DUMMY_FIREBASE_CONFIG;
  
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicialización de la aplicación Firebase y servicios
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
setLogLevel('debug');

// Referencias a Colecciones
const getPackagesCollectionRef = (userId) => collection(db, 'artifacts', appId, 'users', userId, 'packages');
const getReservationsCollectionRef = (userId) => collection(db, 'artifacts', appId, 'users', userId, 'reservations');


// --- 1. COMPONENTES ATÓMICOS Y REUTILIZABLES ---

// Componente InputField (Átomo)
const InputField = ({ label, id, value, onChange, placeholder = "", type = "text", error, min = undefined, step = undefined }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      className={`mt-1 p-2 w-full border rounded-md shadow-sm transition-all duration-200 focus:ring-blue-500 focus:border-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// Componente ActionButton (Átomo)
const ActionButton = ({ children, onClick, disabled, className = "bg-blue-600 hover:bg-blue-700", type = "button" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type}
    className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 ${className} ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    {children}
  </button>
);

// Componente ConfirmationModal (Modal Personalizado)
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
        <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <ActionButton onClick={onCancel} className="bg-gray-500 hover:bg-gray-600">
            Cancelar
          </ActionButton>
          <ActionButton onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Confirmar
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

// Componente SelectField (Átomo)
const SelectField = ({ label, id, value, onChange, options, error }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`mt-1 p-2 w-full border rounded-md shadow-sm transition-all duration-200 focus:ring-blue-500 focus:border-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">Seleccione una opción...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);


// --- 2. COMPONENTES DE FLUJO DE NEGOCIO (MÓDULOS) ---

// Componente PackageForm (Formulario de Creación/Edición) - (Sin cambios funcionales)
const PackageForm = ({ currentPackage, onSave, onCancel }) => {
  const initialFormState = { name: '', description: '', duration: 0, price: 0, isActive: true };
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentPackage) {
      setForm({
        name: currentPackage.name, description: currentPackage.description,
        duration: currentPackage.duration, price: currentPackage.price,
        isActive: currentPackage.isActive || true,
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [currentPackage]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [id]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "El nombre del paquete es obligatorio.";
    if (form.duration <= 0) newErrors.duration = "La duración debe ser un número positivo.";
    if (form.price <= 0) newErrors.price = "El precio debe ser un número positivo.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const dataToSave = {
        name: form.name, description: form.description,
        duration: form.duration, price: form.price,
        isActive: form.isActive, updatedAt: new Date().toISOString(),
      };
      await onSave(dataToSave);
      setForm(initialFormState);
    } catch (error) {
      console.error("Error al guardar el paquete:", error);
    } finally {
      onCancel(); 
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {currentPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
      </h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Nombre del Paquete"
          id="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ej: Aventura Andina de 7 días"
          error={errors.name}
        />
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Detalles del itinerario, incluye vuelos, hoteles, etc."
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Duración (Días)" id="duration" type="number" value={form.duration} onChange={handleChange} error={errors.duration} min="1" />
          <InputField label="Precio (COP/USD)" id="price" type="number" value={form.price} onChange={handleChange} error={errors.price} min="0.01" step="0.01" />
        </div>
        <div className="mb-6 flex items-center space-x-2">
          <input
            type="checkbox" id="isActive" checked={form.isActive} onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Paquete Activo
          </label>
        </div>
        <div className="flex justify-end space-x-3">
          <ActionButton onClick={onCancel} className="bg-gray-500 hover:bg-gray-600" disabled={isLoading}>
            Cancelar
          </ActionButton>
          <ActionButton type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : currentPackage ? 'Actualizar Paquete' : 'Crear Paquete'}
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

// Componente PackageTable (Tabla de Paquetes) - (Sin cambios funcionales)
const PackageTable = ({ packages, onEdit, onNew, onShowDeleteModal }) => {
  if (!packages || packages.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">No hay Paquetes Turísticos registrados.</h3>
        <ActionButton onClick={onNew}>
          Crear Nuevo Paquete
        </ActionButton>
      </div>
    );
  }

  const sortedPackages = [...packages].filter(pkg => pkg.id).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Paquetes Turísticos</h2>
        <ActionButton onClick={onNew}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Paquete
        </ActionButton>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquete</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración (Días)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedPackages.map((pkg) => (
            <tr key={pkg.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                <div className="text-xs text-gray-500 truncate w-64">{pkg.description.substring(0, 100)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.duration}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">${pkg.price.toLocaleString('es-CO')}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {pkg.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button
                  onClick={() => onEdit(pkg)}
                  className="text-indigo-600 hover:text-indigo-900 mx-2"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
                  </svg>
                </button>
                <button
                  onClick={() => onShowDeleteModal(pkg.id, pkg.name)}
                  className="text-red-600 hover:text-red-900 mx-2"
                  title="Eliminar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// --- NUEVO MÓDULO: GESTIÓN DE RESERVAS ---

const ReservationForm = ({ currentReservation, packages, onSave, onCancel }) => {
    // Modelo de datos de la reserva
    const initialFormState = { 
        packageId: '', 
        clientName: '', 
        clientEmail: '', 
        departureDate: '',
        status: 'PENDIENTE',
        passengers: 1,
        totalPrice: 0,
    };
    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Encuentra el paquete seleccionado
    const selectedPackage = packages.find(p => p.id === form.packageId);

    // Actualiza el formulario si estamos editando o si cambia el paquete seleccionado
    useEffect(() => {
        if (currentReservation) {
            setForm({
                packageId: currentReservation.packageId || '',
                clientName: currentReservation.clientName || '',
                clientEmail: currentReservation.clientEmail || '',
                departureDate: currentReservation.departureDate || '',
                status: currentReservation.status || 'PENDIENTE',
                passengers: currentReservation.passengers || 1,
                totalPrice: currentReservation.totalPrice || 0,
            });
        } else {
            // Si no estamos editando, si hay un paquete seleccionado, calcula el precio total
            if (selectedPackage) {
                setForm(prevForm => ({
                    ...prevForm,
                    totalPrice: prevForm.passengers * selectedPackage.price,
                }));
            } else {
                setForm(initialFormState);
            }
        }
        setErrors({});
    }, [currentReservation, selectedPackage]);


    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { id, value, type } = e.target;
        
        setForm(prevForm => {
            let newValue = value;
            if (type === 'number') {
                newValue = parseInt(value) || 0;
            }

            let newForm = { ...prevForm, [id]: newValue };

            // Recalcular precio total si cambian el paquete o el número de pasajeros
            if ((id === 'packageId' || id === 'passengers') && packages.length > 0) {
                const pkg = (id === 'packageId') 
                    ? packages.find(p => p.id === newValue) 
                    : selectedPackage;
                
                const currentPassengers = (id === 'passengers') ? newValue : prevForm.passengers;
                
                if (pkg) {
                    newForm.totalPrice = currentPassengers * pkg.price;
                } else {
                    newForm.totalPrice = 0;
                }
            }

            return newForm;
        });
    };

    // Función de validación
    const validate = () => {
        const newErrors = {};
        if (!form.packageId) newErrors.packageId = "Debe seleccionar un paquete.";
        if (!form.clientName.trim()) newErrors.clientName = "El nombre del cliente es obligatorio.";
        if (!form.clientEmail.includes('@') || !form.clientEmail.includes('.')) newErrors.clientEmail = "Formato de correo electrónico inválido.";
        if (!form.departureDate) newErrors.departureDate = "La fecha de salida es obligatoria.";
        if (form.passengers < 1) newErrors.passengers = "Debe haber al menos un pasajero.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enviar formulario (Crear o Actualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const dataToSave = {
                ...form,
                passengers: parseInt(form.passengers),
                totalPrice: parseFloat(form.totalPrice),
                updatedAt: new Date().toISOString(),
                // Almacenar el nombre del paquete para facilitar la visualización sin necesidad de joins
                packageName: selectedPackage ? selectedPackage.name : 'Paquete Eliminado', 
            };
            
            await onSave(dataToSave);

        } catch (error) {
            console.error("Error al guardar la reserva:", error);
        } finally {
            setIsLoading(false);
            onCancel(); 
        }
    };
    
    // Opciones para el SelectField de paquetes
    const packageOptions = packages
        .filter(pkg => pkg.isActive)
        .map(pkg => ({
            value: pkg.id,
            label: `${pkg.name} ($${pkg.price.toLocaleString('es-CO')})`,
        }));
        
    const statusOptions = [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'CONFIRMADA', label: 'Confirmada' },
        { value: 'CANCELADA', label: 'Cancelada' },
        { value: 'COMPLETADA', label: 'Completada' },
    ];


    return (
        <div className="p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {currentReservation ? 'Editar Reserva' : 'Crear Nueva Reserva'}
            </h2>
            <form onSubmit={handleSubmit}>
                <SelectField 
                    label="Paquete Seleccionado"
                    id="packageId"
                    value={form.packageId}
                    onChange={handleChange}
                    options={packageOptions}
                    error={errors.packageId}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nombre del Cliente" id="clientName" value={form.clientName} onChange={handleChange} error={errors.clientName} />
                    <InputField label="Email del Cliente" id="clientEmail" type="email" value={form.clientEmail} onChange={handleChange} error={errors.clientEmail} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Fecha de Salida" id="departureDate" type="date" value={form.departureDate} onChange={handleChange} error={errors.departureDate} />
                    <InputField 
                        label="Pasajeros" 
                        id="passengers" 
                        type="number" 
                        value={form.passengers} 
                        onChange={handleChange} 
                        error={errors.passengers} 
                        min="1"
                    />
                    <SelectField 
                        label="Estado de la Reserva"
                        id="status"
                        value={form.status}
                        onChange={handleChange}
                        options={statusOptions}
                        error={errors.status}
                    />
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">Precio Total Estimado:</p>
                    <p className="text-2xl font-extrabold text-blue-800">
                        ${form.totalPrice.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        (Cálculo basado en el precio del paquete y el número de pasajeros.)
                    </p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <ActionButton onClick={onCancel} className="bg-gray-500 hover:bg-gray-600" disabled={isLoading}>
                        Cancelar
                    </ActionButton>
                    <ActionButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : currentReservation ? 'Actualizar Reserva' : 'Crear Reserva'}
                    </ActionButton>
                </div>
            </form>
        </div>
    );
};


const ReservationTable = ({ reservations, onEdit, onNew, onShowDeleteModal }) => {
    if (!reservations || reservations.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">No hay Reservas registradas.</h3>
                <ActionButton onClick={onNew}>
                    Crear Nueva Reserva
                </ActionButton>
            </div>
        );
    }

    const sortedReservations = [...reservations].filter(r => r.id).sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate));
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-green-100 text-green-800';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELADA': return 'bg-red-100 text-red-800';
            case 'COMPLETADA': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Lista de Reservas</h2>
                <ActionButton onClick={onNew}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Reserva
                </ActionButton>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquete</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Salida</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedReservations.map((res) => (
                        <tr key={res.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{res.clientName}</div>
                                <div className="text-xs text-gray-500">{res.clientEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{res.packageName || 'N/D'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(res.departureDate).toLocaleDateString('es-CO')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                ${res.totalPrice ? res.totalPrice.toLocaleString('es-CO') : '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(res.status)}`}>
                                    {res.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <button
                                    onClick={() => onEdit(res)}
                                    className="text-indigo-600 hover:text-indigo-900 mx-2"
                                    title="Editar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onShowDeleteModal(res.id, res.clientName)}
                                    className="text-red-600 hover:text-red-900 mx-2"
                                    title="Eliminar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Componente Wrapper del Módulo de Reservas
const ReservationModule = ({ userId, packages }) => {
    const [reservations, setReservations] = useState([]);
    const [view, setView] = useState('list'); // 'list' o 'form' para el submódulo
    const [currentReservationToEdit, setCurrentReservationToEdit] = useState(null);
    
    // Estado para el modal de confirmación de eliminación de RESERVA
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState(null);

    // Carga de Reservas (onSnapshot)
    useEffect(() => {
        if (!userId) return;

        console.log("Subscribiendo a reservas para el appId:", appId, "y userId:", userId);

        const q = query(getReservationsCollectionRef(userId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const reservationsData = [];
            querySnapshot.forEach((doc) => {
                reservationsData.push({ id: doc.id, ...doc.data() });
            });
            setReservations(reservationsData); 
            console.log("Datos de reservas actualizados:", reservationsData.length);
        }, (error) => {
            console.error("Error al escuchar cambios en Firestore (Reservas):", error);
        });

        return () => unsubscribe();
    }, [userId]);
    
    // Funciones CRUD
    const handleSaveReservation = async (data) => {
        const reservationsRef = getReservationsCollectionRef(userId);
        const now = new Date().toISOString();

        if (currentReservationToEdit) {
            const reservationDocRef = doc(reservationsRef, currentReservationToEdit.id);
            await updateDoc(reservationDocRef, {
                ...data,
                createdAt: currentReservationToEdit.createdAt,
            });
            console.log('Reserva actualizada exitosamente:', currentReservationToEdit.id);
        } else {
            const newData = {
                ...data,
                createdAt: now,
                createdBy: userId,
            };
            await addDoc(reservationsRef, newData);
            console.log('Nueva reserva creada exitosamente.');
        }
    };

    const executeDeleteReservation = async () => {
        if (!reservationToDelete) return;

        try {
            const reservationDocRef = doc(getReservationsCollectionRef(userId), reservationToDelete.id);
            await deleteDoc(reservationDocRef);
            console.log('Reserva eliminada exitosamente:', reservationToDelete.id);
        } catch (error) {
            console.error("Error al eliminar la reserva:", error);
        } finally {
            setReservationToDelete(null);
            setShowDeleteModal(false);
        }
    };

    // Funciones de Navegación/UI
    const handleNew = () => {
        setCurrentReservationToEdit(null);
        setView('form');
    };

    const handleEdit = (res) => {
        setCurrentReservationToEdit(res);
        setView('form');
    };

    const handleCancel = () => {
        setCurrentReservationToEdit(null);
        setView('list');
    };
    
    const handleShowDeleteModal = (reservationId, clientName) => {
        setReservationToDelete({ id: reservationId, name: clientName });
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        setReservationToDelete(null);
        setShowDeleteModal(false);
    };

    return (
        <>
            {view === 'list' && (
                <ReservationTable
                    reservations={reservations}
                    onEdit={handleEdit}
                    onNew={handleNew}
                    onShowDeleteModal={handleShowDeleteModal}
                />
            )}
            
            {view === 'form' && (
                <ReservationForm
                    currentReservation={currentReservationToEdit}
                    packages={packages} // Pasamos los paquetes disponibles
                    onSave={handleSaveReservation}
                    onCancel={handleCancel}
                />
            )}
            
            {/* Modal de Confirmación de Eliminación de RESERVA */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                title="Confirmar Eliminación de Reserva"
                message={`¿Estás seguro de que deseas eliminar la reserva del cliente "${reservationToDelete?.name}"?`}
                onConfirm={executeDeleteReservation}
                onCancel={handleCancelDelete}
            />
        </>
    );
};


// --- 3. COMPONENTES ESTRUCTURALES ---

// Componente Sidebar (Barra de Navegación)
const Sidebar = ({ userId, currentView, setView }) => {
  const isPackageView = currentView === 'packages' || currentView === 'packageForm';
  const isReservationView = currentView === 'reservations' || currentView === 'reservationForm';

  const handleNavClick = (newView) => (e) => {
    e.preventDefault();
    // Forzamos a la vista principal del módulo si el usuario está en el formulario anidado
    if (newView === 'packages') {
        setView('packages');
    } else if (newView === 'reservations') {
        setView('reservations');
    }
  };

  return (
    <div className="w-64 bg-gray-900 h-screen p-4 flex flex-col fixed top-0 left-0">
      <div className="text-white text-2xl font-extrabold mb-8 border-b border-gray-700 pb-4">
        SGRPT
      </div>
      <nav className="flex-grow">
        <a href="#" onClick={handleNavClick('packages')} className={`flex items-center p-3 text-lg font-medium rounded-lg shadow-md mb-2 transition-colors duration-200 ${
            isPackageView ? 'text-white bg-blue-700' : 'text-gray-300 hover:bg-gray-800'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8a4 4 0 110 8 4 4 0 010-8zm-11 7a1 1 0 000 2h2a1 1 0 100-2H1zm20 0a1 1 0 100 2h2a1 1 0 100-2h-2z" />
          </svg>
          Paquetes Turísticos
        </a>
        <a href="#" onClick={handleNavClick('reservations')} className={`flex items-center p-3 text-lg font-medium rounded-lg shadow-md mb-2 transition-colors duration-200 ${
            isReservationView ? 'text-white bg-blue-700' : 'text-gray-300 hover:bg-gray-800'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Reservas
        </a>
        <a href="#" className="flex items-center p-3 text-lg font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Clientes (Pendiente)
        </a>
      </nav>
      {/* Muestra el ID de Usuario para fines de colaboración */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 font-semibold mb-1">ID de Usuario:</p>
        {/* El userId es el UID de Firebase o un UUID anónimo */}
        <p className="text-xs text-blue-300 break-all">{userId}</p>
      </div>
    </div>
  );
};


// --- 4. COMPONENTE PRINCIPAL (APP) ---

const App = () => {
  const [userId, setUserId] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('packages'); // 'packages', 'packageForm', 'reservations'
  
  // Estado para el modal de confirmación de eliminación de PAQUETE
  const [showPackageDeleteModal, setShowPackageDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // 1. Inicialización y Autenticación de Firebase (useEffect)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error de autenticación inicial:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(crypto.randomUUID());
      }
      if (loading) setLoading(false);
    });

    initializeAuth();
    return () => unsubscribe();
  }, []);

  // 2. Carga y Escucha en Tiempo Real de Paquetes (onSnapshot)
  useEffect(() => {
    if (!userId) return;

    const q = query(getPackagesCollectionRef(userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const packagesData = [];
      querySnapshot.forEach((doc) => {
        packagesData.push({ id: doc.id, ...doc.data() });
      });
      setPackages(packagesData); 
    }, (error) => {
      console.error("Error al escuchar cambios en Firestore (Paquetes):", error);
    });

    return () => unsubscribe();
  }, [userId]);

  // 3. Funciones CRUD para Paquetes

  // Guardar o Actualizar Paquete
  const handleSavePackage = async (data) => {
    const packagesRef = getPackagesCollectionRef(userId);

    if (view === 'packageForm' && packages.find(p => p.id === packageToDelete?.id)) {
        // En este punto sabemos que estamos editando
      const packageDocRef = doc(packagesRef, packages.find(p => p.id === packageToDelete?.id).id);
      await updateDoc(packageDocRef, {
        ...data,
      });
      console.log('Paquete actualizado exitosamente.');
    } else {
      const newData = {
        ...data,
        createdAt: data.updatedAt,
        createdBy: userId,
      };
      await addDoc(packagesRef, newData);
      console.log('Nuevo paquete creado exitosamente.');
    }
  };


  // Lógica de eliminación de PAQUETE (ejecutada después de la confirmación)
  const executeDeletePackage = async () => {
    if (!packageToDelete) return;

    try {
      const packageDocRef = doc(getPackagesCollectionRef(userId), packageToDelete.id);
      await deleteDoc(packageDocRef);
      console.log('Paquete eliminado exitosamente:', packageToDelete.id);
    } catch (error) {
      console.error("Error al eliminar el paquete:", error);
    } finally {
      setPackageToDelete(null);
      setShowPackageDeleteModal(false);
    }
  };

  // Función para mostrar el modal de eliminación de PAQUETE
  const handleShowDeletePackageModal = (packageId, packageName) => {
    setPackageToDelete({ id: packageId, name: packageName });
    setShowPackageDeleteModal(true);
  };

  // Función para cancelar la eliminación de PAQUETE (cerrar modal)
  const handleCancelDeletePackage = () => {
    setPackageToDelete(null);
    setShowPackageDeleteModal(false);
  };

  // Funciones de navegación para el módulo de Paquetes
  const handleEditPackage = (pkg) => {
    setPackageToDelete(pkg); // Reutilizamos este estado para guardar el paquete a editar
    setView('packageForm'); 
  };

  const handleNewPackage = () => {
    setPackageToDelete(null); // Limpiamos el estado para crear uno nuevo
    setView('packageForm');
  };

  const handleCancelPackageForm = () => {
    setPackageToDelete(null);
    setView('packages'); 
  };


  // Muestra el indicador de carga (LoadingSpinner) mientras Firebase se inicializa o autentica
  if (loading || !userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Cargando aplicación...</p>
      </div>
    );
  }

  // Estructura principal de la aplicación (Layout)
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* 3. Componente Estructural: Sidebar (Barra de Navegación) */}
      <Sidebar userId={userId} currentView={view} setView={setView} />

      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 p-4 bg-white shadow-md rounded-lg">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {view === 'packages' || view === 'packageForm' ? 'Módulo de Gestión de Paquetes' : 'Módulo de Gestión de Reservas'}
          </h1>
        </header>

        {/* --- Renderizado de Módulos (Navegación Principal) --- */}
        
        {/* Módulo de Paquetes */}
        {(view === 'packages' || view === 'packageForm') && (
            <>
                {view === 'packages' && (
                    <PackageTable
                        packages={packages}
                        onEdit={handleEditPackage}
                        onShowDeleteModal={handleShowDeletePackageModal}
                        onNew={handleNewPackage}
                    />
                )}

                {view === 'packageForm' && (
                    <PackageForm
                        currentPackage={packageToDelete}
                        onSave={handleSavePackage}
                        onCancel={handleCancelPackageForm}
                    />
                )}
            </>
        )}

        {/* Módulo de Reservas */}
        {view === 'reservations' && (
            <ReservationModule userId={userId} packages={packages} />
        )}

      </main>

      {/* 5. Modal de Confirmación Global (para Paquetes) */}
      <ConfirmationModal
        isOpen={showPackageDeleteModal}
        title="Confirmar Eliminación de Paquete"
        message={`¿Estás seguro de que deseas eliminar el paquete "${packageToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={executeDeletePackage}
        onCancel={handleCancelDeletePackage}
      />
    </div>
  );
};

export default App;