import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IPersonal } from '../models/IPersonal';

export class PersonalService {
    private _context: any;
    private _listName: string = "Personal EWS";

    constructor(context: any) { this._context = context; }

    public async getPersonal(): Promise<IPersonal[]> {
        try {
            // Seleccionamos Id, Title (NombreyApellido), Rol y FotoPerfil
            const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,Title,Rol,FotoPerfil`;
            const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1, {
                headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '' }
            });

            if (!response.ok) return [];
            const data = await response.json();
            
            return (data.value || []).map((item: any) => ({
                Id: item.Id,
                NombreyApellido: item.Title,
                Rol: item.Rol,
                // Al ser hipervínculo, accedemos a .Url
                FotoPerfil: item.FotoPerfil ? item.FotoPerfil.Url : undefined
            }));
        } catch (error) {
            console.error("Error en getPersonal:", error);
            return [];
        }
    }

    public async subirFoto(file: File): Promise<string> {
        // 1. Subir el archivo a la biblioteca 'FotosPersonal'
        const serverRelativeUrl = `${this._context.pageContext.web.serverRelativeUrl}/FotosPersonal`;
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/getfolderbyserverrelativeurl('${serverRelativeUrl}')/files/add(url='${file.name}',overwrite=true)`;

        const options: ISPHttpClientOptions = {
            body: file,
            headers: {
                "Accept": "application/json;odata=nometadata",
                "Content-type": file.type
            }
        };

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
        if (!response.ok) throw new Error("Error al subir archivo a la biblioteca");

        const data = await response.json();
        // Retornamos la URL absoluta para guardarla en el hipervínculo
        return `${window.location.origin}${data.ServerRelativeUrl}`;
    }

    public async crearTrabajador(nuevo: { NombreyApellido: string, Rol: string, FotoPerfil?: string }): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        
        const body: any = {
            Title: nuevo.NombreyApellido,
            Rol: nuevo.Rol
        };

        // Si hay foto, la enviamos como el objeto que requiere la columna Hipervínculo
        if (nuevo.FotoPerfil) {
            body.FotoPerfil = {
                '__metadata': { 'type': 'SP.FieldUrlValue' },
                'Description': nuevo.NombreyApellido,
                'Url': nuevo.FotoPerfil
            };
        }

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=verbose', // Verbose es necesario para objetos complejos como URL
                'Content-type': 'application/json;odata=verbose',
                'odata-version': ''
            },
            body: JSON.stringify(body)
        });
    }

    public async getRolOptions(): Promise<string[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/fields?$filter=EntityPropertyName eq 'Rol'`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.value && data.value[0]) ? data.value[0].Choices : [];
    }
}