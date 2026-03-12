export type EstadoPresupuesto = 'PRESUPUESTO' | 'ACEPTADO OK' | 'STOCK ALMACEN';
export type EstadoObra = 'En Proceso' | 'Finalizado';

export interface IObra {
    Id: number;
    Title: string; // Nombre del proyecto
    Descripcion?: string;
    DireccionObra?: string;
    FechaInicio?: string;   // ISO String
    FechaFinPrevista?: string; // ISO String
    EstadoObra: EstadoObra;       // El que ya tenías (Completada, En Proceso, etc.)
    Cliente?: {
        Title: string;
    };

}