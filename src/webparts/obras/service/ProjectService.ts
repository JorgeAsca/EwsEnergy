import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IObra } from '../models/IObra';

export class ProjectService {
    private _context: any;
    private _listName: string = "Proyectos EWS"; // Asegúrate que coincide con tu lista

    constructor(context: any) {
        this._context = context;
    }

    public async getObras(): Promise<IObra[]> {
        // Expandimos Cliente para obtener su Title si lo necesitas mostrar en la tabla
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items?$select=*,Cliente/Title&$expand=Cliente`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const data = await response.json();
        return data.value;
    }

    public async crearObra(nuevaObra: any): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        
        const body = JSON.stringify({
            Title: nuevaObra.Nombre,
            Descripcion: nuevaObra.Descripcion,
            ClienteId: nuevaObra.ClienteId, // Enviamos el ID del cliente seleccionado
            DireccionObra: nuevaObra.Direccion,
            FechaInicio: nuevaObra.FechaInicio.toISOString(),
            FechaFinPrevista: nuevaObra.FechaFin.toISOString(),
            EstadoObra: "En Proceso" // Estado inicial por defecto
        });

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'odata-version': ''
            },
            body: body
        });

        if (!response.ok) {
            throw new Error("Error al crear la obra en SharePoint");
        }
    }
}