import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IPersonal } from '../models/IPersonal';

export class PersonalService {
    private _context: WebPartContext;
    private _baseUrl: string;

    constructor(context: WebPartContext) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }



    /**
     * Obtiene todos los trabajadores de la lista de Personal
     */
    public async getPersonal(): Promise<IPersonal[]> {
        // Seleccionamos ID, Nombre (Title), Rol, Email y la Foto de perfil
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Personal')/items?$select=Id,Title,Rol,Email,FotoPerfil`;

        const response: SPHttpClientResponse = await this._context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
        );

        if (!response.ok) {
            throw new Error("Error al obtener la lista de personal");
        }

        const data = await response.json();

        return data.value.map((item: any) => {
            return {
                Id: item.Id,
                Title: item.Title,
                Rol: item.Rol,
                Email: item.Email,
                // Manejamos la foto de perfil si existe (campo tipo Imagen de SharePoint)
                FotoPerfil: item.FotoPerfil ? { Url: JSON.parse(item.FotoPerfil).serverRelativeUrl } : null
            } as IPersonal;
        });
    }
    /**
     * Filtra personal por Empresa Asociada (útil para el Administrador)
     */
    public async getPersonalByEmpresa(empresaId: number): Promise<IPersonal[]> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Personal')/items?$filter=EmpresaAsociadaId eq ${empresaId}`;

        const response: SPHttpClientResponse = await this._context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
        );

        const data = await response.json();
        return data.value as IPersonal[];
    }

    public async crearTrabajador(nuevo: { Title: string, Rol: string, Email: string }): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Personal')/items`;

        const body = JSON.stringify({
            Title: nuevo.Title,
            Rol: nuevo.Rol,
            Email: nuevo.Email
        });

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: body,
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json"
            }
        });
    }

    public async eliminarTrabajador(id: number): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Personal')/items(${id})`;
        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'X-HTTP-Method': 'DELETE',
                'IF-MATCH': '*'
            }
        });
    }

}