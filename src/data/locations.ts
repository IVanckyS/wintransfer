/**
 * Ubicaciones para el autocompletado de origen/destino del formulario.
 * Dataset local (sin API ni costo): aeropuertos + ciudades y comunas de Chile,
 * con cobertura detallada del Gran Concepción y la zona de operación.
 *
 * Para autocompletado de direcciones exactas (calle y número) se puede migrar
 * a Google Places API en fase 2 (requiere API key con facturación — es lo que
 * usa limotak.com). Este listado se puede extender libremente.
 */

export interface Location {
  /** Nombre que se inserta en el campo */
  name: string;
  /** Región o referencia que se muestra como texto secundario */
  region: string;
  type: 'airport' | 'city';
}

export const LOCATIONS: Location[] = [
  // ---- Aeropuertos ----
  { name: 'Aeropuerto Carriel Sur (CCP)', region: 'Talcahuano, Biobío', type: 'airport' },
  { name: 'Aeropuerto Arturo Merino Benítez (SCL)', region: 'Santiago', type: 'airport' },
  { name: 'Aeropuerto La Araucanía (ZCO)', region: 'Temuco', type: 'airport' },
  { name: 'Aeropuerto El Tepual (PMC)', region: 'Puerto Montt', type: 'airport' },
  { name: 'Aeropuerto Pichoy (ZAL)', region: 'Valdivia', type: 'airport' },
  { name: 'Aeródromo Cañal Bajo (ZOS)', region: 'Osorno', type: 'airport' },
  { name: 'Aeropuerto Chacalluta (ARI)', region: 'Arica', type: 'airport' },
  { name: 'Aeropuerto Diego Aracena (IQQ)', region: 'Iquique', type: 'airport' },
  { name: 'Aeropuerto Cerro Moreno (ANF)', region: 'Antofagasta', type: 'airport' },
  { name: 'Aeropuerto El Loa (CJC)', region: 'Calama', type: 'airport' },
  { name: 'Aeropuerto Desierto de Atacama (CPO)', region: 'Copiapó', type: 'airport' },
  { name: 'Aeropuerto La Florida (LSC)', region: 'La Serena', type: 'airport' },
  { name: 'Aeródromo Balmaceda (BBA)', region: 'Aysén', type: 'airport' },
  { name: 'Aeropuerto Carlos Ibáñez del Campo (PUQ)', region: 'Punta Arenas', type: 'airport' },

  // ---- Gran Concepción y Biobío ----
  { name: 'Concepción', region: 'Biobío', type: 'city' },
  { name: 'Concepción Centro', region: 'Biobío', type: 'city' },
  { name: 'Terminal de Buses Collao', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Hotel Holiday Inn', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Hotel Wyndham Pettra', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Hotel Diego de Almagro', region: 'Concepción, Biobío', type: 'city' },
  { name: 'Talcahuano', region: 'Biobío', type: 'city' },
  { name: 'Hualpén', region: 'Biobío', type: 'city' },
  { name: 'San Pedro de la Paz', region: 'Biobío', type: 'city' },
  { name: 'Chiguayante', region: 'Biobío', type: 'city' },
  { name: 'Penco', region: 'Biobío', type: 'city' },
  { name: 'Lirquén', region: 'Penco, Biobío', type: 'city' },
  { name: 'Tomé', region: 'Biobío', type: 'city' },
  { name: 'Dichato', region: 'Tomé, Biobío', type: 'city' },
  { name: 'Pingueral', region: 'Tomé, Biobío', type: 'city' },
  { name: 'Coronel', region: 'Biobío', type: 'city' },
  { name: 'Lota', region: 'Biobío', type: 'city' },
  { name: 'El Venado', region: 'Biobío', type: 'city' },
  { name: 'Idahue', region: 'Biobío', type: 'city' },
  { name: 'Hualqui', region: 'Biobío', type: 'city' },
  { name: 'Santa Juana', region: 'Biobío', type: 'city' },
  { name: 'Florida', region: 'Biobío', type: 'city' },
  { name: 'Los Ángeles', region: 'Biobío', type: 'city' },
  { name: 'Cabrero', region: 'Biobío', type: 'city' },
  { name: 'Yumbel', region: 'Biobío', type: 'city' },
  { name: 'Laja', region: 'Biobío', type: 'city' },
  { name: 'Nacimiento', region: 'Biobío', type: 'city' },
  { name: 'Mulchén', region: 'Biobío', type: 'city' },
  { name: 'Arauco', region: 'Biobío', type: 'city' },
  { name: 'Curanilahue', region: 'Biobío', type: 'city' },
  { name: 'Lebu', region: 'Biobío', type: 'city' },
  { name: 'Cañete', region: 'Biobío', type: 'city' },

  // ---- Ñuble ----
  { name: 'Chillán', region: 'Ñuble', type: 'city' },
  { name: 'Chillán Viejo', region: 'Ñuble', type: 'city' },
  { name: 'Quillón', region: 'Ñuble', type: 'city' },
  { name: 'Termas de Chillán', region: 'Ñuble', type: 'city' },
  { name: 'San Carlos', region: 'Ñuble', type: 'city' },
  { name: 'Bulnes', region: 'Ñuble', type: 'city' },
  { name: 'Quirihue', region: 'Ñuble', type: 'city' },
  { name: 'Coelemu', region: 'Ñuble', type: 'city' },

  // ---- Norte ----
  { name: 'Arica', region: 'Arica y Parinacota', type: 'city' },
  { name: 'Iquique', region: 'Tarapacá', type: 'city' },
  { name: 'Alto Hospicio', region: 'Tarapacá', type: 'city' },
  { name: 'Antofagasta', region: 'Antofagasta', type: 'city' },
  { name: 'Calama', region: 'Antofagasta', type: 'city' },
  { name: 'San Pedro de Atacama', region: 'Antofagasta', type: 'city' },
  { name: 'Tocopilla', region: 'Antofagasta', type: 'city' },
  { name: 'Copiapó', region: 'Atacama', type: 'city' },
  { name: 'Vallenar', region: 'Atacama', type: 'city' },
  { name: 'Caldera', region: 'Atacama', type: 'city' },
  { name: 'La Serena', region: 'Coquimbo', type: 'city' },
  { name: 'Coquimbo', region: 'Coquimbo', type: 'city' },
  { name: 'Ovalle', region: 'Coquimbo', type: 'city' },
  { name: 'Illapel', region: 'Coquimbo', type: 'city' },

  // ---- Zona central ----
  { name: 'Valparaíso', region: 'Valparaíso', type: 'city' },
  { name: 'Viña del Mar', region: 'Valparaíso', type: 'city' },
  { name: 'Quilpué', region: 'Valparaíso', type: 'city' },
  { name: 'Villa Alemana', region: 'Valparaíso', type: 'city' },
  { name: 'Concón', region: 'Valparaíso', type: 'city' },
  { name: 'Quillota', region: 'Valparaíso', type: 'city' },
  { name: 'San Antonio', region: 'Valparaíso', type: 'city' },
  { name: 'Los Andes', region: 'Valparaíso', type: 'city' },
  { name: 'San Felipe', region: 'Valparaíso', type: 'city' },
  { name: 'Santiago', region: 'Metropolitana', type: 'city' },
  { name: 'Providencia', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'Las Condes', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'Vitacura', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'Ñuñoa', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'Maipú', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'La Florida', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'Puente Alto', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'San Bernardo', region: 'Santiago, Metropolitana', type: 'city' },
  { name: 'Rancagua', region: "O'Higgins", type: 'city' },
  { name: 'Machalí', region: "O'Higgins", type: 'city' },
  { name: 'San Fernando', region: "O'Higgins", type: 'city' },
  { name: 'Santa Cruz', region: "O'Higgins", type: 'city' },
  { name: 'Pichilemu', region: "O'Higgins", type: 'city' },
  { name: 'Talca', region: 'Maule', type: 'city' },
  { name: 'Curicó', region: 'Maule', type: 'city' },
  { name: 'Linares', region: 'Maule', type: 'city' },
  { name: 'Constitución', region: 'Maule', type: 'city' },
  { name: 'Cauquenes', region: 'Maule', type: 'city' },

  // ---- Sur ----
  { name: 'Temuco', region: 'La Araucanía', type: 'city' },
  { name: 'Padre Las Casas', region: 'La Araucanía', type: 'city' },
  { name: 'Villarrica', region: 'La Araucanía', type: 'city' },
  { name: 'Pucón', region: 'La Araucanía', type: 'city' },
  { name: 'Angol', region: 'La Araucanía', type: 'city' },
  { name: 'Victoria', region: 'La Araucanía', type: 'city' },
  { name: 'Valdivia', region: 'Los Ríos', type: 'city' },
  { name: 'La Unión', region: 'Los Ríos', type: 'city' },
  { name: 'Río Bueno', region: 'Los Ríos', type: 'city' },
  { name: 'Panguipulli', region: 'Los Ríos', type: 'city' },
  { name: 'Osorno', region: 'Los Lagos', type: 'city' },
  { name: 'Puerto Montt', region: 'Los Lagos', type: 'city' },
  { name: 'Puerto Varas', region: 'Los Lagos', type: 'city' },
  { name: 'Frutillar', region: 'Los Lagos', type: 'city' },
  { name: 'Llanquihue', region: 'Los Lagos', type: 'city' },
  { name: 'Castro', region: 'Los Lagos (Chiloé)', type: 'city' },
  { name: 'Ancud', region: 'Los Lagos (Chiloé)', type: 'city' },
  { name: 'Quellón', region: 'Los Lagos (Chiloé)', type: 'city' },
  { name: 'Coyhaique', region: 'Aysén', type: 'city' },
  { name: 'Puerto Aysén', region: 'Aysén', type: 'city' },
  { name: 'Punta Arenas', region: 'Magallanes', type: 'city' },
  { name: 'Puerto Natales', region: 'Magallanes', type: 'city' },
  { name: 'Porvenir', region: 'Magallanes', type: 'city' },
];
