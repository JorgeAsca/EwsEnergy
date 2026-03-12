// src/webparts/obras/service/PersonalService.ts
import { SPHttpClient } from '@microsoft/sp-http';
import { IPersonal } from '../models/IPersonal';

export class PersonalService {
    private _context: any;
    private _listName: string = "Personal EWS";

    constructor(context: any) { this._context = context; }

    public async getPersonal(): Promise<IPersonal[]> {
        try {
            // Consulta ultra-simplificada
            const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,NombreyApellido,Rol`;
            const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

            if (!response.ok) return [];
            const data = await response.json();
            return data.value || [];
        } catch (error) {
            console.error("Error en el servicio de personal:", error);
            return [];
        }
    }

    public async crearTrabajador(nuevo: { NombreyApellido: string, Rol: string }): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const body = JSON.stringify({
            NombreyApellido: nuevo.NombreyApellido,
            Rol: nuevo.Rol
        });

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            body: body
        });
    }
}