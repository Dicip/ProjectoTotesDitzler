
import type { KpiData, TimeSeriesDataPoint, PieDataPoint, ToteCompanyHolder, OverdueToteInfo } from './kpi-data';
import type { User } from '@/app/(app)/usuarios/schema';
import type { Tote } from '@/app/(app)/totes/schema';
import type { Cliente } from '@/app/(app)/clientes/schema';
import { subDays, format } from 'date-fns';

// --- Mock KPI Data ---
const generateUserSignups = (): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  for (let i = 14; i >= 0; i--) {
    data.push({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
};

export const mockKpiData: KpiData = {
  userSignups: generateUserSignups(),
  totalTotes: 150,
  totesInUseByCompany: [
    { companyName: 'Jugos Frescos del Valle', toteCount: 45 },
    { companyName: 'Frutas del Maipo Ltda.', toteCount: 30 },
    { companyName: 'Exportadora Sol Radiante S.A.', toteCount: 20 },
    { companyName: 'Agroindustrial Los Andes', toteCount: 15 },
  ],
  totesByStatus: [
    { name: 'Disponible', value: 40, fill: 'hsl(var(--chart-1))' },
    { name: 'En Uso', value: 85, fill: 'hsl(var(--chart-4))' },
    { name: 'En Lavado', value: 20, fill: 'hsl(var(--chart-2))' },
    { name: 'En Mantenimiento', value: 5, fill: 'hsl(var(--chart-3))' },
  ],
  overdueTotes: [
      { companyName: 'Jugos Frescos del Valle', count: 5 },
      { companyName: 'Frutas del Maipo Ltda.', count: 2 },
  ]
};

// --- Mock Users ---
export const mockUsers: User[] = [
  { id: '1', name: 'Ana Martínez (Admin)', email: 'ana.martinez@example.com', role: 'Admin', status: 'Active', avatar: 'https://placehold.co/40x40.png?text=AM', createdAt: subDays(new Date(), 2).toISOString(), registeredBy: 'Admin Panel' },
  { id: '2', name: 'Carlos Gómez (Editor)', email: 'carlos.gomez@example.com', role: 'Editor', status: 'Active', avatar: 'https://placehold.co/40x40.png?text=CG', createdAt: subDays(new Date(), 10).toISOString(), registeredBy: 'Admin Panel' },
  { id: '3', name: 'Lucía Fernández (Viewer)', email: 'lucia.fernandez@example.com', role: 'Viewer', status: 'Inactive', avatar: 'https://placehold.co/40x40.png?text=LF', createdAt: subDays(new Date(), 25).toISOString(), registeredBy: 'API' },
  { id: '4', name: 'Jorge Díaz (Viewer)', email: 'jorge.diaz@example.com', role: 'Viewer', status: 'Active', avatar: 'https://placehold.co/40x40.png?text=JD', createdAt: subDays(new Date(), 40).toISOString(), registeredBy: 'Admin Panel' },
];

// --- Mock Totes ---
export const mockTotes: Tote[] = [
    { id: '101', codigoIdentificacion: 'TOTE-PL-001', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 50).toISOString(), fechaRetornoPrevista: subDays(new Date(), -10).toISOString(), notas: 'Asignado a Jugos del Valle' },
    { id: '102', codigoIdentificacion: 'TOTE-AI-002', tipoMaterial: 'Acero Inoxidable', capacidad: 500, unidadCapacidad: 'Kg', estadoActual: 'Disponible', ubicacion: 'Patio 2', fechaAdquisicion: subDays(new Date(), 120).toISOString(), fechaRetornoPrevista: null, notas: '' },
    { id: '103', codigoIdentificacion: 'TOTE-PL-003', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Lavado', ubicacion: 'Patio 1', fechaAdquisicion: subDays(new Date(), 30).toISOString(), fechaRetornoPrevista: null, notas: 'Limpieza profunda requerida' },
    { id: '104', codigoIdentificacion: 'TOTE-PL-004', tipoMaterial: 'Plástico HDPE', capacidad: 1000, unidadCapacidad: 'Litros', estadoActual: 'En Uso', ubicacion: 'Exterior', fechaAdquisicion: subDays(new Date(), 5).toISOString(), fechaRetornoPrevista: subDays(new Date(), 2).toISOString(), notas: 'Retorno vencido' },
    { id: '105', codigoIdentificacion: 'TOTE-OT-005', tipoMaterial: 'Otro', capacidad: 750, unidadCapacidad: 'Litros', estadoActual: 'En Mantenimiento', ubicacion: 'Patio 3', fechaAdquisicion: subDays(new Date(), 200).toISOString(), fechaRetornoPrevista: null, notas: 'Válvula defectuosa' },
    { id: '106', codigoIdentificacion: 'TOTE-PL-006', tipoMaterial: 'Plástico HDPE', capacidad: 1200, unidadCapacidad: 'Litros', estadoActual: 'Disponible', ubicacion: 'Patio 2', fechaAdquisicion: subDays(new Date(), 15).toISOString(), fechaRetornoPrevista: null, notas: 'Nuevo' },
];


// --- Mock Clientes ---
export const mockClientes: Cliente[] = [
    { id: '201', nombreEmpresa: 'Jugos Frescos del Valle', contactoPrincipal: 'Mariana Rivera', emailContacto: 'mariana.r@jfvalle.cl', telefono: '+56987654321', tipo: 'Mayorista', estado: 'Activo', logoUrl: 'https://placehold.co/40x40.png?text=JV', fechaCreacion: subDays(new Date(), 300).toISOString() },
    { id: '202', nombreEmpresa: 'Frutas del Maipo Ltda.', contactoPrincipal: 'Pedro Castillo', emailContacto: 'pedro.c@delmaipo.cl', telefono: '+56912345678', tipo: 'Distribuidor', estado: 'Activo', logoUrl: 'https://placehold.co/40x40.png?text=FM', fechaCreacion: subDays(new Date(), 500).toISOString() },
    { id: '203', nombreEmpresa: 'Retail del Sur S.A.', contactoPrincipal: 'Isidora Neira', emailContacto: 'isidora.n@retailsur.cl', telefono: '+56955554444', tipo: 'Minorista', estado: 'Inactivo', logoUrl: 'https://placehold.co/40x40.png?text=RS', fechaCreacion: subDays(new Date(), 150).toISOString() },
];
