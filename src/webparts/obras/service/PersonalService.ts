import { SPHttpClient } from '@microsoft/sp-http';
import { IPersonal } from '../models/IPersonal';

export class PersonalService {
    private _context: any;
    private _listName: string = "Personal EWS";

    constructor(context: any) { this._context = context; }

    public async getPersonal(): Promise<IPersonal[]> {
        try {
            // Cambiamos NombreyApellido por Title
            const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,Title,Rol`;
            const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1, {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': ''
                }
            });

            if (!response.ok) return [];
            const data = await response.json();
            
            // Mapeamos 'Title' a 'NombreyApellido' para no romper tu interfaz IPersonal
            return (data.value || []).map((item: any) => ({
                Id: item.Id,
                NombreyApellido: item.Title, 
                Rol: item.Rol
            }));
        } catch (error) {
            console.error("Error en el servicio de personal:", error);
            return [];
        }
    }

    public async crearTrabajador(nuevo: { NombreyApellido: string, Rol: string }): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const body = JSON.stringify({
            Title: nuevo.NombreyApellido, // Enviamos como Title
            Rol: nuevo.Rol
        });

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            body: body
        });

        if (!response.ok) throw new Error("Error al crear trabajador");
    }
}