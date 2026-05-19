import { WebPartContext } from '@microsoft/sp-webpart-base';
import { RolUsuario } from '../models/IPersonal';
export declare class UserService {
    private _context;
    private _baseUrl;
    constructor(context: WebPartContext);
    /**
     * Determina el rol del usuario actual consultando sus grupos de SharePoint
     */
    getRolActual(): Promise<RolUsuario>;
    /**
     * Obtiene la información del perfil del usuario logueado
     */
    getInfoUsuario(): {
        nombre: string;
        email: string;
        id: string;
    };
}
//# sourceMappingURL=UserService.d.ts.map