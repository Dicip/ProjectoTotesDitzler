
import type { KpiData, TimeSeriesDataPoint, PieDataPoint, ToteCompanyHolder, OverdueToteInfo } from './kpi-data';
import type { User } from '@/app/(app)/usuarios/schema';
import type { Tote } from '@/app/(app)/totes/schema';
import type { Cliente } from '@/app/(app)/clientes/schema';
import { subDays, format, isBefore, parseISO, startOfDay, addDays } from 'date-fns';

// =================================================================
// BASE MOCK DATA
// This is the source of truth for the demo.
// =================================================================

export const mockUsers: User[] = [
  { id: '1', name: 'Ana Martínez (Admin)', email: 'ana.martinez@example.com', role: 'Admin', status: 'Active', avatar: 'https://placehold.co/40x40.png?text=AM', createdAt: subDays(new Date(), 2).toISOString(), registeredBy: 'Admin Panel' },
  { id: '2', name: 'Carlos Gómez (Editor)', email: 'carlos.gomez@example.com', role: 'Editor', status: 'Active', avatar: 'https://placehold.co/40x40.png?text=CG', createdAt: subDays(new Date(), 10).toISOString(), registeredBy: 'Admin Panel' },
  { id: '3', name: 'Lucía Fernández (Viewer)', email: 'lucia.fernandez@example.com', role: 'Viewer', status: 'Inactive', avatar: 'https://placehold.co/40x40.png?text=LF', createdAt: subDays(new Date(), 25).toISOString(), registeredBy: 'API' },
  { id: '4', name: 'Jorge Díaz (Viewer)', email: 'jorge.diaz@example.com', role: 'Viewer', status: 'Active', avatar: 'https://placehold.co/40x40.png?text=JD', createdAt: subDays(new Date(), 40).toISOString(), registeredBy: 'Admin Panel' },
];


export const mockClientes: Cliente[] = [
    { id: '201', nombreEmpresa: 'Jugos Frescos del Valle', contactoPrincipal: 'Mariana Rivera', emailContacto: 'mariana.r@jfvalle.cl', telefono: '+56987654321', tipo: 'Mayorista', estado: 'Activo', logoUrl: 'https://placehold.co/40x40.png?text=JV', fechaCreacion: subDays(new Date(), 300).toISOString() },
    { id: '202', nombreEmpresa: 'Frutas del Maipo Ltda.', contactoPrincipal: 'Pedro Castillo', emailContacto: 'pedro.c@delmaipo.cl', telefono: '+56912345678', tipo: 'Distribuidor', estado: 'Activo', logoUrl: 'https://placehold.co/40x40.png?text=FM', fechaCreacion: subDays(new Date(), 500).toISOString() },
    { id: '203', nombreEmpresa: 'Retail del Sur S.A.', contactoPrincipal: 'Isidora Neira', emailContacto: 'isidora.n@retailsur.cl', telefono: '+56955554444', tipo: 'Minorista', estado: 'Inactivo', logoUrl: 'https://placehold.co/40x40.png?text=RS', fechaCreacion: subDays(new Date(), 150).toISOString() },
    { id: '204', nombreEmpresa: 'Exportadora Sol Radiante S.A.', contactoPrincipal: 'Roberto Parra', emailContacto: 'roberto.p@solradiante.com', telefono: '+56223456789', tipo: 'Mayorista', estado: 'Activo', logoUrl: 'https://placehold.co/40x40.png?text=SR', fechaCreacion: subDays(new Date(), 80).toISOString() },
    { id: '205', nombreEmpresa: 'Agroindustrial Los Andes', contactoPrincipal: 'Carmen Gloria Soto', emailContacto: 'cgloria.s@agroandes.cl', telefono: '+56977778888', tipo: 'Distribuidor', estado: 'Activo', logoUrl: 'https://placehold.co/40x40.png?text=AL', fechaCreacion: subDays(new Date(), 400).toISOString() },
];

export const mockTotes: Tote[] = [
    { id: '101', codigoIdentificacion: 'TOTE-PL-001', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 50).toISOString(), fechaRetornoPrevista: addDays(new Date(), 10).toISOString(), notas: `Asignado a ${mockClientes[0].nombreEmpresa}` },
    { id: '102', codigoIdentificacion: 'TOTE-AI-002', tipoMaterial: 'Acero Inoxidable', capacidad: 500, unidadCapacidad: 'Kg', estadoActual: 'Disponible', ubicacion: 'Patio 2', fechaAdquisicion: subDays(new Date(), 120).toISOString(), fechaRetornoPrevista: null, notas: '' },
    { id: '103', codigoIdentificacion: 'TOTE-PL-003', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Lavado', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 30).toISOString(), fechaRetornoPrevista: null, notas: 'Limpieza profunda requerida' },
    { id: '104', codigoIdentificacion: 'TOTE-PL-004', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Exterior', fechaAdquisicion: subDays(new Date(), 5).toISOString(), fechaRetornoPrevista: subDays(new Date(), 2).toISOString(), notas: `Asignado a ${mockClientes[1].nombreEmpresa}` },
    { id: '105', codigoIdentificacion: 'TOTE-OT-005', tipoMaterial: 'Otro', capacidad: 750, unidadCapacidad: 'Litros', estadoActual: 'En Mantenimiento', ubicacion: 'Patio 3', fechaAdquisicion: subDays(new Date(), 200).toISOString(), fechaRetornoPrevista: null, notas: 'Válvula defectuosa' },
    { id: '106', codigoIdentificacion: 'TOTE-PL-006', tipoMaterial: 'Plástico HDPE', capacidad: 1200, unidadCapacidad: 'Litros', estadoActual: 'Disponible', ubicacion: 'Patio 2', fechaAdquisicion: subDays(new Date(), 15).toISOString(), fechaRetornoPrevista: null, notas: 'Nuevo' },
    { id: '107', codigoIdentificacion: 'TOTE-PL-007', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 45).toISOString(), fechaRetornoPrevista: addDays(new Date(), 15).toISOString(), notas: `Asignado a ${mockClientes[0].nombreEmpresa}` },
    { id: '108', codigoIdentificacion: 'TOTE-PL-008', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 3', fechaAdquisicion: subDays(new Date(), 60).toISOString(), fechaRetornoPrevista: subDays(new Date(), 5).toISOString(), notas: `Asignado a ${mockClientes[3].nombreEmpresa}` },
    { id: '109', codigoIdentificacion: 'TOTE-AI-009', tipoMaterial: 'Acero Inoxidable', capacidad: 800, unidadCapacidad: 'Kg', estadoActual: 'En Uso', ubicacion: 'Exterior', fechaAdquisicion: subDays(new Date(), 90).toISOString(), fechaRetornoPrevista: addDays(new Date(), 20).toISOString(), notas: `Asignado a ${mockClientes[4].nombreEmpresa}` },
    { id: '110', codigoIdentificacion: 'TOTE-PL-010', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'Disponible', ubicacion: 'Patio 2', fechaAdquisicion: subDays(new Date(), 25).toISOString(), fechaRetornoPrevista: null, notas: '' },
    { id: '111', codigoIdentificacion: 'TOTE-PL-011', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 10).toISOString(), fechaRetornoPrevista: addDays(new Date(), 5).toISOString(), notas: `Asignado a ${mockClientes[1].nombreEmpresa}` },
    { id: '112', codigoIdentificacion: 'TOTE-PL-012', tipoMaterial: 'Plástico HDPE', capacidad: 1200, unidadCapacidad: 'Litros', estadoActual: 'En Lavado', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 5).toISOString(), fechaRetornoPrevista: null, notas: '' },
    { id: '113', codigoIdentificacion: 'TOTE-PL-013', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 2', fechaAdquisicion: subDays(new Date(), 22).toISOString(), fechaRetornoPrevista: subDays(new Date(), 1).toISOString(), notas: 'Asignado a Planta Principal (Interno)' },
    { id: '114', codigoIdentificacion: 'TOTE-AI-014', tipoMaterial: 'Acero Inoxidable', capacidad: 500, unidadCapacidad: 'Kg', estadoActual: 'De Baja', ubicacion: 'Patio 3', fechaAdquisicion: subDays(new Date(), 500).toISOString(), fechaRetornoPrevista: null, notas: 'Fisura irreparable' },
    { id: '115', codigoIdentificacion: 'TOTE-PL-015', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 3', fechaAdquisicion: subDays(new Date(), 33).toISOString(), fechaRetornoPrevista: addDays(new Date(), 30).toISOString(), notas: `Asignado a ${mockClientes[3].nombreEmpresa}` },
];


// =================================================================
// DERIVED & SYNCHRONIZED KPI DATA
// This data is generated from the base data above to ensure consistency.
// =================================================================

// --- Helper Functions ---
const isToteOverdue = (tote: Tote): boolean => {
  if (tote.estadoActual === "En Uso" && tote.fechaRetornoPrevista) {
    try {
      const returnDate = parseISO(tote.fechaRetornoPrevista);
      const today = startOfDay(new Date());
      return isBefore(returnDate, today);
    } catch { 
      return false;
    }
  }
  return false;
};

const getClientNameFromNote = (note?: string): string | null => {
    if (!note || !note.startsWith('Asignado a ')) return null;
    return note.substring('Asignado a '.length);
}

// --- KPI Data Generation ---
const userSignups = (): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  for (let i = 29; i >= 0; i--) { // 30 days of data
    data.push({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * 5) + (i % 7 === 0 ? 3 : 0), // Spike on weekends
    });
  }
  return data;
};

const totalTotes = mockTotes.length;

const totesByStatusMap = mockTotes.reduce((acc, tote) => {
  if (tote.estadoActual !== 'De Baja') {
    acc[tote.estadoActual] = (acc[tote.estadoActual] || 0) + 1;
  }
  return acc;
}, {} as Record<Tote['estadoActual'], number>);

const totesByStatus: PieDataPoint[] = Object.entries(totesByStatusMap)
  .map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

const totesInUseByCompanyMap = mockTotes
  .filter(t => t.estadoActual === 'En Uso')
  .reduce((acc, tote) => {
    const clientName = getClientNameFromNote(tote.notas) || 'Planta Principal (Interno)';
    acc[clientName] = (acc[clientName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

const totesInUseByCompany: ToteCompanyHolder[] = Object.entries(totesInUseByCompanyMap)
  .map(([companyName, toteCount]) => ({ companyName, toteCount }))
  .sort((a,b) => b.toteCount - a.toteCount);


const overdueTotesMap = mockTotes
  .filter(t => isToteOverdue(t))
  .reduce((acc, tote) => {
    const clientName = getClientNameFromNote(tote.notas) || 'Planta Principal (Interno)';
    acc[clientName] = (acc[clientName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

const overdueTotes: OverdueToteInfo[] = Object.entries(overdueTotesMap)
  .map(([companyName, count]) => ({ companyName, count }))
  .sort((a,b) => b.count - a.count);

// --- Final Export ---
export const mockKpiData: KpiData = {
  userSignups: userSignups(),
  totalTotes,
  totesByStatus,
  totesInUseByCompany,
  overdueTotes,
};
