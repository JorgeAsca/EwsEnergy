import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
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
        // Obtenemos 'Title' y lo mapearemos después a 'NombreyApellido'
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,Title,Rol,EmpresaAsociadaId,FotoPerfil`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const data = await response.json();

        // Mapeo manual para que el componente reciba 'NombreyApellido'
        return (data.value || []).map((item: any) => ({
            Id: item.Id,
            NombreyApellido: item.Title, // Mapeamos Title -> NombreyApellido
            Rol: item.Rol,
            EmpresaAsociadaId: item.EmpresaAsociadaId,
            FotoPerfil: item.FotoPerfil
        }));
    }

    public async crearTrabajador(nuevo: Partial<IPersonal>): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const body = JSON.stringify({
            'Title': nuevo.NombreyApellido,
            'Rol': nuevo.Rol
        });

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error en la prueba de conexión:", errorText);
            throw new Error("Fallo al insertar solo Nombre y Rol.");
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