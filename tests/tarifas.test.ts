import { describe, it, expect } from 'vitest';
import { TARIFAS, findTarifa, quoteTrip, isCarrielSur } from '../src/data/tarifas';
import { LOCATIONS } from '../src/data/locations';

const AIRPORT = 'Aeropuerto Carriel Sur (CCP)';

describe('tabla', () => {
  it('tiene las 21 rutas oficiales', () => expect(TARIFAS).toHaveLength(21));
  it('todo bancoChile es el 70% del original', () => {
    for (const t of TARIFAS) expect(t.bancoChile).toBe(Math.round(t.original * 0.7));
  });
});

describe('findTarifa', () => {
  it('matchea sin tildes ni mayúsculas', () => {
    expect(findTarifa('CONCEPCIÓN')?.id).toBe('concepcion-centro');
    expect(findTarifa('quillon')?.original).toBe(120000);
  });
  it('matchea alias parciales de rutas compuestas', () => {
    expect(findTarifa('Lota')?.id).toBe('coronel-lota');
    expect(findTarifa('Pingueral')?.id).toBe('dichato-pingueral');
    expect(findTarifa('Lirquén')?.id).toBe('penco-lirquen');
  });
  it('devuelve undefined si no hay tarifa', () => {
    expect(findTarifa('Punta Arenas')).toBeUndefined();
  });
});

describe('quoteTrip', () => {
  it('cotiza aeropuerto → destino y destino → aeropuerto', () => {
    const a = quoteTrip(AIRPORT, 'Talcahuano', 2);
    const b = quoteTrip('Talcahuano', AIRPORT, 1);
    expect(a.status).toBe('ok');
    expect(b.status).toBe('ok');
    if (a.status === 'ok') expect(a.tarifa.original).toBe(30000);
  });
  it('3+ pasajeros → consult (hay tarifa pero se cotiza)', () => {
    expect(quoteTrip(AIRPORT, 'Santiago', 3).status).toBe('consult');
  });
  it('sin Carriel Sur en un extremo → none', () => {
    expect(quoteTrip('Concepción', 'Santiago', 1).status).toBe('none');
  });
  it('destino sin tarifa → none', () => {
    expect(quoteTrip(AIRPORT, 'Pucón', 1).status).toBe('none');
  });
});

describe('isCarrielSur', () => {
  it('reconoce variantes', () => {
    expect(isCarrielSur(AIRPORT)).toBe(true);
    expect(isCarrielSur('aeropuerto carriel sur')).toBe(true);
    expect(isCarrielSur('Aeropuerto Arturo Merino Benítez (SCL)')).toBe(false);
  });
});

describe('consistencia con el autocompletado', () => {
  it('cada tarifa es alcanzable desde al menos una ubicación del autocompletado', () => {
    const names = LOCATIONS.map((l) => l.name);
    for (const t of TARIFAS) {
      const reachable = names.some((n) => findTarifa(n)?.id === t.id);
      expect(reachable, `tarifa sin ubicación: ${t.id}`).toBe(true);
    }
  });
});
