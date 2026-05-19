import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IAsignacion } from "../models/IAsignacion";
import { IPersonal } from "../models/IPersonal";
import { IObra } from "../models/IObra";
export declare class AsignacionesService {
    private _context;
    private _listName;
    constructor(context: WebPartContext);
    getDatosPanel(): Promise<{
        obras: any;
        personal: any;
        asignaciones: any;
    }>;
    getAsignaciones(): Promise<IAsignacion[]>;
    getObrasActivas(): Promise<IObra[]>;
    getPersonalDisponible(): Promise<IPersonal[]>;
    calcularSemaforoAsignacion(fechaFinStr?: string): {
        label: string;
        presence: number;
    };
    crearAsignacion(obraId: number, personalId: number, fechaFin: Date): Promise<void>;
    asignarPersonal(asignacion: IAsignacion): Promise<void>;
    eliminarAsignacion(id: number): Promise<void>;
    actualizarAsignacion(id: number, datos: Partial<IAsignacion>): Promise<void>;
    getCuadrillaSugerida(obraId: number, operarioId: number, asignaciones: any[], personal: IPersonal[]): IPersonal[];
}
//# sourceMappingURL=AsignacionesService.d.ts.map