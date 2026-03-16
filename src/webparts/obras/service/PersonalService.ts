import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IPersonal } from '../models/IPersonal';

export class PersonalService {
    private _context: any;
    private _listName: string = "Personal EWS";

    constructor(context: any) { this._context = context; }

    public async getPersonal(): Promise<IPersonal[]> {
        try {
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
                FotoPerfil: item.FotoPerfil ? item.FotoPerfil.Url : undefined
            }));
        } catch (error) {
            console.error("Error en getPersonal:", error);
            return [];
        }
    }

    public async subirFoto(file: File): Promise<string> {
        const serverRelativeUrl = `${this._context.pageContext.web.serverRelativeUrl}/Fotos_Personal`;
        const fileName = encodeURIComponent(file.name);
        
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/getfolderbyserverrelativeurl('${serverRelativeUrl}')/files/add(url='${fileName}',overwrite=true)`;

        const options: ISPHttpClientOptions = {
            body: file,
            headers: {
                "Accept": "application/json;odata=nometadata",
                "Content-type": file.type
            }
        };

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Detalle del error de subida (404 significa ruta mal escrita):", errorText);
            throw new Error("Error al subir archivo a la biblioteca");
        }

        const data = await response.json();
        // Retornamos la URL absoluta
        return `${window.location.origin}${data.ServerRelativeUrl}`;
    }

    public async crearTrabajador(nuevo: { NombreyApellido: string, Rol: string, FotoPerfil?: string }): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        
        const body: any = {
            Title: nuevo.NombreyApellido,
            Rol: nuevo.Rol
        };

        if (nuevo.FotoPerfil) {
            body.FotoPerfil = {
                '__metadata': { 'type': 'SP.FieldUrlValue' },
                'Description': nuevo.NombreyApellido,
                'Url': nuevo.FotoPerfil
            };
        }

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': ''
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Error al crear ítem:", err);
            throw new Error("Error en la creación del registro");
        }
    }

    public async getRolOptions(): Promise<string[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/fields?$filter=EntityPropertyName eq 'Rol'`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.value && data.value[0]) ? data.value[0].Choices : [];
    }
}