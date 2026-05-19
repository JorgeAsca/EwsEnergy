import { IObra } from "../models/IObra";
import { IObraCard } from "../models/IObraCard";
export declare class ProjectService {
    private _context;
    private _listName;
    constructor(context: any);
    getObras(): Promise<IObra[]>;
    crearObra(nuevaObra: any): Promise<void>;
    updateObra(id: number, obraActualizada: any): Promise<void>;
    actualizarProgresoObra(id: number, nuevoProgreso: number): Promise<void>;
    actualizarEstado(id: number, nuevoEstado: string): Promise<void>;
    getFotosPorObra(obraId: number): Promise<any[]>;
    getAsignacionesConPersonal(): Promise<any[]>;
    finalizarObra(id: number): Promise<void>;
    cancelarObra(id: number): Promise<void>;
    getObrasCompletas(asignaciones: any[], personal: any[]): Promise<IObraCard[]>;
}
//# sourceMappingURL=ProjectService.d.ts.map