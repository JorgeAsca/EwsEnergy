import { IPersonal } from '../models/IPersonal';
export declare class PersonalService {
    private _context;
    private _listName;
    constructor(context: any);
    getPersonal(): Promise<IPersonal[]>;
    /**
     * Obtiene los archivos de la biblioteca 'Fotos_Personal' para elegirlos en el formulario
     */
    getFotosDisponibles(): Promise<{
        key: string;
        text: string;
        url: string;
    }[]>;
    crearTrabajador(nuevo: {
        NombreyApellido: string;
        Rol: string;
        FotoPerfil?: string;
    }): Promise<void>;
    getRolOptions(): Promise<string[]>;
    actualizarTrabajador(id: number, datos: any): Promise<void>;
    eliminarTrabajador(id: number): Promise<void>;
}
//# sourceMappingURL=PersonalService.d.ts.map