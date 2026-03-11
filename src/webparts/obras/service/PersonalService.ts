// src/webparts/obras/service/PersonalService.ts
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IPersonal } from '../models/IPersonal';

export class PersonalService {
    private _context: WebPartContext;
    private _baseUrl: string;
    private _listName: string = "Personal EWS";

    constructor(context: WebPartContext) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }

    public async getPersonal(): Promise<IPersonal[]> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,Title,Rol,Email`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const data = await response.json();
        return data.value || [];
    }

    public async crearTrabajador(nuevo: any): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
            body: JSON.stringify({
                Title: nuevo.Title,
                Rol: nuevo.Rol,
                Email: nuevo.Email
            })
        });
        if (!response.ok) throw new Error("Error al insertar usuario en Personal EWS");
    }

    public async eliminarTrabajador(id: number): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;
        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' }
        });
    }

    public async actualizarTrabajador(id: number, datos: any): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;
        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: { 
                'Accept': 'application/json', 
                'Content-type': 'application/json', 
                'X-HTTP-Method': 'MERGE', 
                'IF-MATCH': '*' 
            },
            body: JSON.stringify(datos)
        });
    }
}