import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IObra } from '../models/IObra';

export class ProjectService {
    private _context: any;
    private _listName: string = "Proyectos y Obras";

    constructor(context: any) {
        this._context = context;
    }

    public async getObras(): Promise<IObra[]> {
        try {
            // Usamos una consulta más robusta: pedimos ID, Title y expandimos el Cliente
            const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=Id,Title,Descripcion,DireccionObra,FechaInicio,FechaFinPrevista,EstadoObra,Cliente/Id,Cliente/Title&$expand=Cliente`;

            const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error en la petición a SharePoint:", errorText);
                return [];
            }

            const data = await response.json();
            return data.value || [];
        } catch (error) {
            console.error("Error al obtener obras:", error);
            return [];
        }
    }

    public async crearObra(nuevaObra: any): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const body = JSON.stringify({
            Title: nuevaObra.Nombre,
            Descripcion: nuevaObra.Descripcion,
            ClienteId: nuevaObra.ClienteId,
            DireccionObra: nuevaObra.Direccion,
            FechaInicio: nuevaObra.FechaInicio.toISOString(),
            FechaFinPrevista: nuevaObra.FechaFin.toISOString(),
            EstadoObra: "En Proceso"
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
            const errorDetail = await response.text();
            console.error("Error detallado:", errorDetail);
            throw new Error("Error de validación en columnas");
        }
    }

    public async getUltimaFotoObra(nombreObra: string): Promise<string | null> {
        const carpeta = nombreObra.replace(/[/\\?%*:|"<>]/g, '-');
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/getfolderbyserverrelativeurl('Fotos_Diario/${carpeta}')/files?$orderby=TimeLastModified desc&$top=1`;

        try {
            const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
            if (response.ok) {
                const data = await response.json();
                if (data.value && data.value.length > 0) {
                    return data.value[0].ServerRelativeUrl;
                }
            }
        } catch (e) { console.error("Sin fotos para esta obra"); }
        return null;
    }
    public async getAsignacionesConPersonal(): Promise<any[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Asignaciones EWS')/items?$select=Id,ObraId,PersonalId,Personal/NombreyApellido,Personal/FotoPerfil&$expand=Personal`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const data = await response.json();
        return data.value || [];
    }

}