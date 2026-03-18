import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IAsignacion } from '../models/IAsignacion';

export class AsignacionesService {
    private _context: WebPartContext;
    private _listName = "Asignaciones EWS";

    constructor(context: WebPartContext) {
        this._context = context;
    }

    public async getAsignaciones(): Promise<IAsignacion[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const data = await response.json();
        return data.value || []; // Siempre devolver un array
    }

    public async asignarPersonal(asignacion: IAsignacion): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        
        // SharePoint requiere strings ISO para las fechas
        const body = {
            Title: `Asignación Obra ${asignacion.ObraId}`,
            ObraId: asignacion.ObraId,
            PersonalId: asignacion.PersonalId,
            FechaInicio: asignacion.FechaInicio.toISOString(),
            FechaFinPrevista: asignacion.FechaFinPrevista.toISOString(),
            EstadoProgreso: asignacion.EstadoProgreso
        };

        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': '3.0' // DEBE ser 3.0
            },
            body: JSON.stringify(body)
        };

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
        
        if (!response.ok) {
            const error = await response.text();
            console.error("Detalle del error:", error);
            throw new Error("Error al guardar en SharePoint");
        }
    }

    // Eliminación de asignación (opcional, para funcionalidad de seguimiento)
public async eliminarAsignacion(id: number): Promise<void> {
    const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Asignaciones EWS')/items(${id})`;

    const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-HTTP-Method': 'DELETE',
            'IF-MATCH': '*',
            'odata-version': '3.0' // <--- CAMBIO CRÍTICO AQUÍ
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error detallado de SharePoint:", errorText);
        throw new Error(`No se pudo eliminar: ${response.statusText}`);
    }
}

    public async actualizarAsignacion(id: number, datos: Partial<IAsignacion>): Promise<void> {
    const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;
    await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*',
            'odata-version': ''
        },
        body: JSON.stringify(datos)
    });
}
}