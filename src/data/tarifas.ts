/**
 * Tarifario oficial entregado por el cliente el 2026-06-30 (correo).
 * Todas las rutas parten/llegan al Aeropuerto Carriel Sur y valen para 1–2
 * pasajeros (con 3+ se cotiza por WhatsApp). `bancoChile` es el valor con
 * −30% pagando con tarjetas Banco de Chile (solo informativo en la web:
 * online se cobra `original` porque Webpay no permite verificar el banco).
 * Editar valores aquí actualiza calculadora y cobro (el servidor importa
 * este mismo archivo — nunca confía en montos del navegador).
 */

export interface Tarifa {
  id: string;
  /** Nombre para mostrar en la UI y en correos */
  label: string;
  /** Valor por tramo en CLP */
  original: number;
  /** Valor por tramo con −30% tarjetas Banco de Chile */
  bancoChile: number;
  /** Textos (normalizados con normalizeLoc) que matchean el campo origen/destino */
  aliases: string[];
}

/** Las tarifas publicadas cubren hasta este número de pasajeros. */
export const TARIFA_PAX_MAX = 2;

// Tildes/diacríticos como rango unicode explícito (igual que en SmartForm).
const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g');
export const normalizeLoc = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(COMBINING, '').trim();

export const TARIFAS: Tarifa[] = [
  { id: 'concepcion-centro', label: 'Concepción Centro', original: 15000, bancoChile: 10500, aliases: ['concepcion', 'concepcion centro'] },
  { id: 'hoteles-concepcion', label: 'Hoteles Holiday Inn / Wyndham Pettra / Diego de Almagro', original: 10000, bancoChile: 7000, aliases: ['hoteles holiday inn / wyndham pettra / diego de almagro', 'hotel holiday inn', 'hotel wyndham pettra', 'hotel diego de almagro'] },
  { id: 'terminal-collao', label: 'Terminal de Buses Collao', original: 15000, bancoChile: 10500, aliases: ['terminal de buses collao', 'terminal collao'] },
  { id: 'talcahuano', label: 'Talcahuano', original: 30000, bancoChile: 21000, aliases: ['talcahuano'] },
  { id: 'hualpen', label: 'Hualpén', original: 25000, bancoChile: 17500, aliases: ['hualpen'] },
  { id: 'san-pedro', label: 'San Pedro de la Paz', original: 25000, bancoChile: 17500, aliases: ['san pedro de la paz'] },
  { id: 'chiguayante', label: 'Chiguayante', original: 35000, bancoChile: 24500, aliases: ['chiguayante'] },
  { id: 'penco-lirquen', label: 'Penco-Lirquén', original: 35000, bancoChile: 24500, aliases: ['penco', 'lirquen', 'penco-lirquen'] },
  { id: 'coronel-lota', label: 'Coronel-Lota', original: 35000, bancoChile: 24500, aliases: ['coronel', 'lota', 'coronel-lota'] },
  { id: 'venado-idahue', label: 'El Venado-Idahue', original: 30000, bancoChile: 21000, aliases: ['el venado', 'idahue', 'el venado-idahue'] },
  { id: 'tome', label: 'Tomé', original: 45000, bancoChile: 31500, aliases: ['tome'] },
  { id: 'dichato-pingueral', label: 'Dichato-Pingueral', original: 50000, bancoChile: 35000, aliases: ['dichato', 'pingueral', 'dichato-pingueral'] },
  { id: 'florida', label: 'Florida', original: 110000, bancoChile: 77000, aliases: ['florida'] },
  { id: 'quillon', label: 'Quillón', original: 120000, bancoChile: 84000, aliases: ['quillon'] },
  { id: 'chillan', label: 'Chillán', original: 150000, bancoChile: 105000, aliases: ['chillan'] },
  { id: 'los-angeles', label: 'Los Ángeles', original: 150000, bancoChile: 105000, aliases: ['los angeles'] },
  { id: 'talca', label: 'Talca', original: 200000, bancoChile: 140000, aliases: ['talca'] },
  { id: 'termas-chillan', label: 'Termas de Chillán', original: 250000, bancoChile: 175000, aliases: ['termas de chillan'] },
  { id: 'temuco', label: 'Temuco', original: 450000, bancoChile: 315000, aliases: ['temuco'] },
  { id: 'valdivia', label: 'Valdivia', original: 550000, bancoChile: 385000, aliases: ['valdivia'] },
  { id: 'santiago', label: 'Santiago', original: 580000, bancoChile: 406000, aliases: ['santiago'] },
];

export const isCarrielSur = (text: string) => normalizeLoc(text).includes('carriel sur');

export function findTarifa(text: string): Tarifa | undefined {
  const q = normalizeLoc(text);
  return TARIFAS.find((t) => t.aliases.includes(q));
}

export type Quote = { status: 'ok' | 'consult'; tarifa: Tarifa } | { status: 'none' };

/** Cotiza un viaje: exige Carriel Sur en un extremo y tarifa conocida en el otro. */
export function quoteTrip(origin: string, destination: string, passengers: number): Quote {
  const other = isCarrielSur(origin) ? destination : isCarrielSur(destination) ? origin : null;
  if (other === null) return { status: 'none' };
  const tarifa = findTarifa(other);
  if (!tarifa) return { status: 'none' };
  return { status: passengers > TARIFA_PAX_MAX ? 'consult' : 'ok', tarifa };
}
