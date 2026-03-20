export type EstadoPresupuesto = 'PRESUPUESTO' | 'ACEPTADO OK' | 'STOCK ALMACEN';
export type EstadoObra = 'En Proceso' | 'Finalizado';

export interface IObra {
    Id: number;
    Title: string; 
    Descripcion?: string;
    DireccionObra?: string;
    FechaInicio?: string;   
    FechaFinPrevista?: string; 
    EstadoObra: EstadoObra;       
    Cliente?: {
        Title: string;
    };
    ProgresoReal?: number;

}