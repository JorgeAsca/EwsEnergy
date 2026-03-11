export type EstadoPresupuesto = 'PRESUPUESTO' | 'ACEPTADO OK' | 'STOCK ALMACEN';
export type EstadoObra = 'En Proceso' | 'Finalizado';

export interface IObra {
    Id: number;
    Title: string;
    ClienteId: number;
    EstadoPresupuesto: EstadoPresupuesto;
    EstadoObra: EstadoObra;
    FechaInicio?: string;
    PersonalAsignadoId?: number;
    Cliente?: {
        Title: string;
    };
}