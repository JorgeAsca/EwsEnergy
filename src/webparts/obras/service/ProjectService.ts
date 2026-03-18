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

    public async actualizarEstado(id: number, nuevoEstado: string): Promise<void> {
    const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;
    
    await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*',
            'odata-version': ''
        },
        body: JSON.stringify({
            // Asegúrate de que 'Estado' sea el nombre interno de tu columna en SharePoint
            Estado: nuevoEstado 
        })
    });
}
}