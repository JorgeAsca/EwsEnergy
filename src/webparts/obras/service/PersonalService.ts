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

    /**
     * Obtiene el personal de la lista 'Personal EWS' con los campos correctos
     */
    public async getPersonal(): Promise<IPersonal[]> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,NombreyApellido,Rol,EmpresaAsociadaId,FotoPerfil`;

        const response: SPHttpClientResponse = await this._context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al obtener personal: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.value as IPersonal[];
    }

    /**
     * Crea un nuevo trabajador mapeando los campos a las columnas reales de SharePoint
     */
    public async crearTrabajador(nuevo: Partial<IPersonal>): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')`;
        // Obtenemos la URL de los ítems de forma limpia
        const itemsEndpoint = `${endpoint}/items`;

        // IMPORTANTE: Mapeamos NombreyApellido al campo interno 'Title'
        // que es el que SharePoint reconoce por defecto.
        const body = JSON.stringify({
            'Title': nuevo.NombreyApellido,
            'Rol': nuevo.Rol,
            'EmpresaAsociadaId': nuevo.EmpresaAsociadaId || null
        });

        const response = await this._context.spHttpClient.post(itemsEndpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error detallado de SharePoint:", errorText);
            throw new Error("No se pudo insertar en Personal EWS");
        }
    }

    /**
     * Elimina un trabajador por ID
     */
    public async eliminarTrabajador(id: number): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'X-HTTP-Method': 'DELETE',
                'IF-MATCH': '*',
                'odata-version': ''
            }
        });
    }

    /**
     * Actualiza los datos de un trabajador existente
     */
    public async actualizarTrabajador(id: number, datos: Partial<IPersonal>): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'X-HTTP-Method': 'MERGE',
                'IF-MATCH': '*',
                'odata-version': ''
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el trabajador.");
        }
    }
}