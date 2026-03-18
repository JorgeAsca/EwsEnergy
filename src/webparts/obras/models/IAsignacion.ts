import { IPersonal } from "./IPersonal";

export interface IAsignacion {
    Id?: number;
    ObraId: number;
    PersonalId: number;
    Personal?: IPersonal; // Añadimos esta línea para que TS no de error
    FechaInicio: Date;
    FechaFinPrevista: Date;
    EstadoProgreso: number;
    FechaFinReal?: Date;
    Comentarios?: string;
}