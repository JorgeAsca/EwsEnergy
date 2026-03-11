export type EstadoPresupuesto = 'PRESUPUESTO' | 'ACEPTADO OK' | 'STOCK ALMACEN';
export type EstadoObra = 'En Proceso' | 'Finalizado';

export interface IObra {
    Id: number;
    Title: string; // Nombre o código de obra
    ClienteId: number;
    EstadoPresupuesto: EstadoPresupuesto;
    EstadoObra: EstadoObra;
    FechaInicio?: string;
    PersonalAsignadoId?: number;
    // Campos expandidos (cuando hagamos el join con la lista de Clientes)
    Cliente?: {
        Title: string;
    };
}