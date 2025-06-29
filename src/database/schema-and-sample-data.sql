
-- Crear la tabla Usuarios si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios' and xtype='U')
CREATE TABLE Usuarios (
    Id INT PRIMARY KEY IDENTITY(1,1),
    NombreCompleto NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL, -- En producción, esto debería ser mucho más largo para hashes seguros
    Rol NVARCHAR(50) CHECK (Rol IN ('Admin', 'Editor', 'Viewer')) NOT NULL,
    Estado NVARCHAR(50) CHECK (Estado IN ('Active', 'Inactive')) NOT NULL,
    AvatarUrl NVARCHAR(255),
    FechaCreacion DATETIME DEFAULT GETDATE(),
    RegistradoPor NVARCHAR(100)
);
GO

-- Crear la tabla Totes si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Totes' and xtype='U')
CREATE TABLE Totes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CodigoIdentificacion NVARCHAR(50) NOT NULL UNIQUE,
    TipoMaterial NVARCHAR(50) CHECK (TipoMaterial IN ('Plástico HDPE', 'Acero Inoxidable', 'Otro')) NOT NULL,
    Capacidad DECIMAL(10, 2) NOT NULL,
    UnidadCapacidad NVARCHAR(10) CHECK (UnidadCapacidad IN ('Litros', 'Kg')) NOT NULL,
    EstadoActual NVARCHAR(50) CHECK (EstadoActual IN ('Disponible', 'En Uso', 'En Lavado', 'En Mantenimiento', 'De Baja')) NOT NULL,
    UbicacionActual NVARCHAR(100), -- Puede ser el nombre de una empresa cliente o una ubicación interna
    FechaAdquisicion DATETIME DEFAULT GETDATE(),
    FechaUltimoLavado DATETIME,
    FechaRetornoPrevista DATETIME,
    Notas NVARCHAR(MAX),
    UltimaModificacion DATETIME DEFAULT GETDATE()
);
GO

-- Crear la tabla Clientes si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clientes' and xtype='U')
CREATE TABLE Clientes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    NombreEmpresa NVARCHAR(100) NOT NULL,
    ContactoPrincipal NVARCHAR(100),
    EmailContacto NVARCHAR(100) UNIQUE,
    Telefono NVARCHAR(20),
    Tipo NVARCHAR(50) CHECK (Tipo IN ('Mayorista', 'Minorista', 'Distribuidor')) NOT NULL,
    Estado NVARCHAR(50) CHECK (Estado IN ('Activo', 'Inactivo')) NOT NULL,
    LogoUrl NVARCHAR(255),
    FechaCreacion DATETIME DEFAULT GETDATE()
);
GO

-- Insertar datos de ejemplo en Usuarios
PRINT 'Insertando datos de ejemplo en Usuarios...'
INSERT INTO Usuarios (NombreCompleto, Email, PasswordHash, Rol, Estado, AvatarUrl, RegistradoPor, FechaCreacion) VALUES
('Admin DicipWare', 'admin@dicipware.com', '123', 'Admin', 'Active', 'https://placehold.co/40x40.png?text=AD', 'Script Inicial', DATEADD(day, -30, GETDATE())),
('Elena Campos', 'elena.campos@example.com', 'passwordEditor', 'Editor', 'Active', 'https://placehold.co/40x40.png?text=EC', 'Admin DicipWare', DATEADD(day, -25, GETDATE())),
('Carlos Rivas', 'carlos.rivas@example.com', 'passwordViewer', 'Viewer', 'Active', 'https://placehold.co/40x40.png?text=CR', 'Admin DicipWare', DATEADD(day, -20, GETDATE())),
('Sofia Aguilera', 'sofia.aguilera@example.com', 'passwordAdminInactivo', 'Admin', 'Inactive', 'https://placehold.co/40x40.png?text=SA', 'Admin DicipWare', DATEADD(day, -15, GETDATE())),
('Luis Soto', 'luis.soto@example.com', 'passView', 'Viewer', 'Active', 'https://placehold.co/40x40.png?text=LS', 'Admin DicipWare', DATEADD(day, -10, GETDATE())),
('Ana Torres', 'ana.torres@example.com', 'passEdit', 'Editor', 'Active', 'https://placehold.co/40x40.png?text=AT', 'Admin DicipWare', DATEADD(day, -5, GETDATE())),
('Javier Morales', 'javier.morales@example.com', 'passJavi', 'Viewer', 'Active', 'https://placehold.co/40x40.png?text=JM', 'Admin DicipWare', GETDATE());
GO


-- Insertar datos de ejemplo en Totes
PRINT 'Insertando datos de ejemplo en Totes...'
INSERT INTO Totes (CodigoIdentificacion, TipoMaterial, Capacidad, UnidadCapacidad, EstadoActual, UbicacionActual, FechaAdquisicion, FechaRetornoPrevista, Notas) VALUES
('TOTE-PL-001', 'Plástico HDPE', 1000, 'Litros', 'Disponible', 'Bodega Central', DATEADD(day, -90, GETDATE()), NULL, 'Nuevo ingreso'),
('TOTE-AI-002', 'Acero Inoxidable', 500, 'Kg', 'En Uso', 'Frutas del Maipo Ltda.', DATEADD(day, -60, GETDATE()), DATEADD(day, -5, GETDATE()), 'Asignado para pulpa de durazno. Urgente retorno.'),
('TOTE-PL-003', 'Plástico HDPE', 1200, 'Litros', 'En Lavado', 'Zona de Lavado A', DATEADD(day, -45, GETDATE()), NULL, 'Limpieza estándar post-uso'),
('TOTE-OT-004', 'Otro', 800, 'Litros', 'En Mantenimiento', 'Taller', DATEADD(day, -30, GETDATE()), NULL, 'Reparación de válvula'),
('TOTE-PL-005', 'Plástico HDPE', 1000, 'Litros', 'En Uso', 'Exportadora Sol Radiante S.A.', DATEADD(day, -10, GETDATE()), DATEADD(day, 20, GETDATE()), NULL),
('TOTE-PL-006', 'Plástico HDPE', 1000, 'Litros', 'Disponible', 'Bodega Central', DATEADD(day, -5, GETDATE()), NULL, NULL),
('TOTE-AI-007', 'Acero Inoxidable', 750, 'Kg', 'En Uso', 'Planta Principal (Interno)', DATEADD(day, -2, GETDATE()), DATEADD(day, -1, GETDATE()), 'Uso interno para concentrado de manzana.'),
('TOTE-PL-008', 'Plástico HDPE', 1000, 'Litros', 'En Uso', 'Frutas del Maipo Ltda.', DATEADD(day, -15, GETDATE()), DATEADD(day, 5, GETDATE()), 'Transporte de frutillas'),
('TOTE-PL-009', 'Plástico HDPE', 1200, 'Litros', 'De Baja', 'Zona de Descarte', DATEADD(day, -200, GETDATE()), NULL, 'Dañado irreparablemente'),
('TOTE-AI-010', 'Acero Inoxidable', 500, 'Kg', 'Disponible', 'Bodega Refrigerada', DATEADD(day, -50, GETDATE()), NULL, 'Listo para productos sensibles'),
('TOTE-PL-011', 'Plástico HDPE', 1000, 'Litros', 'En Uso', 'Jugos Frescos del Valle', DATEADD(day, -7, GETDATE()), DATEADD(day, 7, GETDATE()), 'Néctar de Pera'),
('TOTE-PL-012', 'Plástico HDPE', 1000, 'Litros', 'En Lavado', 'Zona de Lavado B', DATEADD(day, -3, GETDATE()), NULL, NULL),
('TOTE-AI-013', 'Acero Inoxidable', 600, 'Kg', 'En Uso', 'Exportadora Sol Radiante S.A.', DATEADD(day, -20, GETDATE()), DATEADD(day, -2, GETDATE()), 'Arándanos para exportación'),
('TOTE-PL-014', 'Plástico HDPE', 1000, 'Litros', 'Disponible', 'Bodega Central', DATEADD(day, -1, GETDATE()), NULL, 'Recién lavado'),
('TOTE-OT-015', 'Otro', 900, 'Litros', 'En Mantenimiento', 'Taller', DATEADD(day, -4, GETDATE()), NULL, 'Revisión de estructura');
GO
-- Insertar 10 Totes adicionales para un total de 25 activos (no 'De Baja')
INSERT INTO Totes (CodigoIdentificacion, TipoMaterial, Capacidad, UnidadCapacidad, EstadoActual, UbicacionActual, FechaAdquisicion, FechaRetornoPrevista, Notas) VALUES
('TOTE-PL-016', 'Plástico HDPE', 1000, 'Litros', 'Disponible', 'Bodega Central', DATEADD(day, -6, GETDATE()), NULL, NULL),
('TOTE-AI-017', 'Acero Inoxidable', 500, 'Kg', 'Disponible', 'Bodega Refrigerada', DATEADD(day, -8, GETDATE()), NULL, NULL),
('TOTE-PL-018', 'Plástico HDPE', 1200, 'Litros', 'En Uso', 'Jugos Frescos del Valle', DATEADD(day, -9, GETDATE()), DATEADD(day, 10, GETDATE()), 'Néctar de Manzana'),
('TOTE-OT-019', 'Otro', 800, 'Litros', 'En Lavado', 'Zona de Lavado A', DATEADD(day, -11, GETDATE()), NULL, NULL),
('TOTE-PL-020', 'Plástico HDPE', 1000, 'Litros', 'En Mantenimiento', 'Taller', DATEADD(day, -12, GETDATE()), NULL, 'Cambio de ruedas'),
('TOTE-PL-021', 'Plástico HDPE', 1000, 'Litros', 'Disponible', 'Bodega Central', DATEADD(day, -13, GETDATE()), NULL, NULL),
('TOTE-AI-022', 'Acero Inoxidable', 750, 'Kg', 'En Uso', 'Planta Principal (Interno)', DATEADD(day, -14, GETDATE()), DATEADD(day, 1, GETDATE()), 'Mermelada de Frambuesa'),
('TOTE-PL-023', 'Plástico HDPE', 1000, 'Litros', 'Disponible', 'Bodega Central', DATEADD(day, -16, GETDATE()), NULL, NULL),
('TOTE-AI-024', 'Acero Inoxidable', 500, 'Kg', 'En Uso', 'Distribuidora Central', DATEADD(day, -17, GETDATE()), DATEADD(day, 3, GETDATE()), 'Pulpa de Mango Congelada'),
('TOTE-PL-025', 'Plástico HDPE', 1200, 'Litros', 'En Lavado', 'Zona de Lavado B', DATEADD(day, -18, GETDATE()), NULL, NULL);
GO


-- Insertar datos de ejemplo en Clientes
PRINT 'Insertando datos de ejemplo en Clientes...'
INSERT INTO Clientes (NombreEmpresa, ContactoPrincipal, EmailContacto, Telefono, Tipo, Estado, LogoUrl) VALUES
('Frutas del Maipo Ltda.', 'Ricardo Montes', 'ricardo.montes@fdelmaipo.cl', '+56221234567', 'Mayorista', 'Activo', 'https://placehold.co/40x40.png?text=FM'),
('Exportadora Sol Radiante S.A.', 'Carolina Herrera', 'carolina.herrera@solradiante.com', '+56987654321', 'Exportador', 'Activo', 'https://placehold.co/40x40.png?text=SR'), -- Asumiendo que 'Exportador' es un tipo válido, sino ajustar a Mayorista/Minorista/Distribuidor
('Jugos Frescos del Valle', 'Andrés Bravo', 'andres.bravo@jvalle.cl', '+56329876543', 'Distribuidor', 'Activo', 'https://placehold.co/40x40.png?text=JV'),
('Supermercados El Ahorro', 'Luisa Fernández', 'luisa.fernandez@elahorro.cl', '+56223334455', 'Minorista', 'Activo', 'https://placehold.co/40x40.png?text=EA'),
('Agroindustrial Los Andes', 'Pedro Ramírez', 'pedro.ramirez@agroandes.cl', '+56911223344', 'Mayorista', 'Inactivo', 'https://placehold.co/40x40.png?text=AL'),
('Distribuidora Central', 'Fernanda Soto', 'fernanda.soto@distcentral.cl', '+56276543210', 'Distribuidor', 'Activo', 'https://placehold.co/40x40.png?text=DC'),
('Planta Principal (Interno)', 'Jefe de Planta', 'jefe.planta@dicipware.com', '+5621231234', 'Distribuidor', 'Activo', 'https://placehold.co/40x40.png?text=DP'); -- Cliente interno/planta
GO

PRINT 'Script de inicialización de base de datos completado.'
GO
