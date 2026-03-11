import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IObra } from '../models/IObra';

export class ProjectService {
    private _context: WebPartContext;
    private _baseUrl: string;

    constructor(context: WebPartContext) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }

    /**
     * Obtiene todas las obras incluyendo el nombre del cliente relacionado
     */
    public async getObras(): Promise<IObra[]> {
        // Usamos $select para elegir campos y $expand para traer datos de la lista de Clientes
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Obras')/items?$select=Id,Title,EstadoPresupuesto,EstadoObra,Cliente/Title&$expand=Cliente`;

        const response: SPHttpClientResponse = await this._context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
        );

        if (!response.ok) {
            throw new Error("Error al obtener las obras de SharePoint");
        }

        const data = await response.json();
        return data.value as IObra[];
    }

    /**
     * Actualiza el estado de una obra (Flujo Presupuesto -> Stock)
     */
    public async actualizarEstado(obraId: number, nuevoEstado: string): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Obras')/items(${obraId})`;

        const headers = {
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        };

        const body = JSON.stringify({
            EstadoPresupuesto: nuevoEstado
        });

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: headers,
            body: body
        });
    }

    public async asignarPersonalAObra(obraId: number, trabajadorId: number): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Obras')/items(${obraId})`;

        const body = JSON.stringify({
            // 'ResponsableId' es el nombre interno de la columna tipo Persona
            ResponsableId: trabajadorId
        });

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: body,
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json",
                "X-HTTP-Method": "MERGE",
                "IF-MATCH": "*"
            }
        });
    }
}