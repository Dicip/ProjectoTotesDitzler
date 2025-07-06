
import type { KpiData, PieDataPoint, ToteCompanyHolder, OverdueToteInfo } from './kpi-data';
import type { User } from '@/app/(app)/usuarios/schema';
import type { Tote } from '@/app/(app)/totes/schema';
import type { Cliente } from '@/app/(app)/clientes/schema';
import { subDays, format, isBefore, parseISO, startOfDay, addDays, differenceInDays } from 'date-fns';

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
    // Tote 1: OK, with client < 30 days
    { id: '101', codigoIdentificacion: 'TOTE-PL-001', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'Con Cliente', ubicacion: 'Cliente', fechaAdquisicion: subDays(new Date(), 50).toISOString(), 
      producto: 'Pulpa de Frutilla', lote: 'L-202405A', clienteId: '201', fechaEnvasado: subDays(new Date(), 15).toISOString(), fechaVencimiento: addDays(new Date(), 45).toISOString(), fechaDespacho: subDays(new Date(), 15).toISOString(), notas: `Ruta Santiago` },
    // Tote 2: OK, Disponible
    { id: '102', codigoIdentificacion: 'TOTE-AI-002', tipoMaterial: 'Acero Inoxidable', capacidad: 500, unidadCapacidad: 'Kg', estadoActual: 'Disponible', ubicacion: 'Patio de recepción', fechaAdquisicion: subDays(new Date(), 120).toISOString() },
    // Tote 3: OK, En Lavado
    { id: '103', codigoIdentificacion: 'TOTE-PL-003', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Lavado', ubicacion: 'Ken – Lavadora de CIP y COP de totes', fechaAdquisicion: subDays(new Date(), 30).toISOString(), notas: 'Limpieza profunda requerida' },
    // Tote 4: FUERA DE PLAZO (> 30 days with client)
    { id: '104', codigoIdentificacion: 'TOTE-PL-004', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'Con Cliente', ubicacion: 'Cliente', fechaAdquisicion: subDays(new Date(), 40).toISOString(), 
      producto: 'Mermelada de Mora', lote: 'L-202404B', clienteId: '202', fechaEnvasado: subDays(new Date(), 35).toISOString(), fechaVencimiento: addDays(new Date(), 25).toISOString(), fechaDespacho: subDays(new Date(), 35).toISOString(), notas: `Ruta Valparaíso` },
    // Tote 5: OK, En Mantenimiento
    { id: '105', codigoIdentificacion: 'TOTE-OT-005', tipoMaterial: 'Otro', capacidad: 750, unidadCapacidad: 'Litros', estadoActual: 'En Mantenimiento', ubicacion: 'Antecámara Planta', fechaAdquisicion: subDays(new Date(), 200).toISOString(), notas: 'Válvula defectuosa' },
    // Tote 6: FUERA DE PLAZO (Expired product)
    { id: '106', codigoIdentificacion: 'TOTE-PL-006', tipoMaterial: 'Plástico HDPE', capacidad: 1200, unidadCapacidad: 'Litros', estadoActual: 'Con Cliente', ubicacion: 'Cliente', fechaAdquisicion: subDays(new Date(), 15).toISOString(), 
      producto: 'Pulpa de Manzana', lote: 'L-202405C', clienteId: '204', fechaEnvasado: subDays(new Date(), 10).toISOString(), fechaVencimiento: subDays(new Date(), 1).toISOString(), fechaDespacho: subDays(new Date(), 10).toISOString() },
    // Tote 7: OK, En produccion
    { id: '107', codigoIdentificacion: 'TOTE-PL-007', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Producción (Envasado)', fechaAdquisicion: subDays(new Date(), 45).toISOString(),
      producto: 'Pulpa de Frambuesa', lote: 'L-202405D', fechaEnvasado: new Date().toISOString() },
    // Tote 8: OK, Almacenado en cámara
    { id: '108', codigoIdentificacion: 'TOTE-PL-008', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'Disponible', ubicacion: 'Cámara 1', fechaAdquisicion: subDays(new Date(), 60).toISOString(),
      producto: 'Jugo de Arándano', lote: 'L-202405E', fechaEnvasado: subDays(new Date(), 2).toISOString(), fechaVencimiento: addDays(new Date(), 90).toISOString() },
    // Tote 9: De Baja
    { id: '114', codigoIdentificacion: 'TOTE-AI-014', tipoMaterial: 'Acero Inoxidable', capacidad: 500, unidadCapacidad: 'Kg', estadoActual: 'De Baja', ubicacion: 'Patio de recepción', fechaAdquisicion: subDays(new Date(), 500).toISOString(), notas: 'Fisura irreparable' },
];


// =================================================================
// DERIVED & SYNCHRONIZED KPI DATA
// =================================================================

// --- Helper Functions ---
const isToteOverdue = (tote: Tote): boolean => {
  if (tote.estadoActual !== "Con Cliente") {
    return false;
  }
  
  // Condición 1: Si la fecha de despacho es superior o igual a 30 días
  if (tote.fechaDespacho) {
    try {
      if (differenceInDays(new Date(), parseISO(tote.fechaDespacho)) >= 30) {
        return true;
      }
    } catch { /* ignore invalid date */ }
  }

  // Condición 2: Si el tote está en status cliente es inferior a 30 días, pero la fecha de vencimiento está cumplida
  if (tote.fechaVencimiento) {
    try {
      if (isBefore(parseISO(tote.fechaVencimiento), startOfDay(new Date()))) {
        return true;
      }
    } catch { /* ignore invalid date */ }
  }

  return false;
};

// --- KPI Data Generation ---
const activeUsers = mockUsers.filter(user => user.status === 'Active').length;

const totalTotes = mockTotes.filter(t => t.estadoActual !== 'De Baja').length;

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

const totesConClienteMap = mockTotes
  .filter(t => t.estadoActual === 'Con Cliente' && t.clienteId)
  .reduce((acc, tote) => {
    const cliente = mockClientes.find(c => c.id === tote.clienteId);
    const clientName = cliente?.nombreEmpresa || 'Cliente Desconocido';
    acc[clientName] = (acc[clientName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

const totesInUseByCompany: ToteCompanyHolder[] = Object.entries(totesConClienteMap)
  .map(([companyName, toteCount]) => ({ companyName, toteCount }))
  .sort((a,b) => b.toteCount - a.toteCount);


const overdueTotesMap = mockTotes
  .filter(isToteOverdue)
  .reduce((acc, tote) => {
    const cliente = mockClientes.find(c => c.id === tote.clienteId);
    const clientName = cliente?.nombreEmpresa || 'Cliente Desconocido';
    acc[clientName] = (acc[clientName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

const overdueTotes: OverdueToteInfo[] = Object.entries(overdueTotesMap)
  .map(([companyName, count]) => ({ companyName, count }))
  .sort((a,b) => b.count - a.count);

// --- Final Export ---
export const mockKpiData: KpiData = {
  activeUsers,
  totalTotes,
  totesByStatus,
  totesInUseByCompany,
  overdueTotes,
};
