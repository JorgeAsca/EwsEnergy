import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IDiarioEntrada {
    ObraId: number;
    Comentarios: string;
    FotosUrls: string[]; // Aquí guardaremos los links que nos dé el PhotoService
    Fecha: string;
}

export class DailyReportService {
    private _context: WebPartContext;
    private _baseUrl: string;
    private _metadataListName: string = "Registro_Fotos_Diarias";

    constructor(context: WebPartContext) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }

    /**
     * Guarda el reporte diario vinculando el texto con las URLs de las fotos
     */
    public async guardarReporteDiario(reporte: IDiarioEntrada): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Diario de Trabajo')/items`;

        const body = JSON.stringify({
            Title: `Reporte - Obra ${reporte.ObraId} - ${reporte.Fecha}`,
            ObraId: reporte.ObraId,
            Comentarios: reporte.Comentarios,
            // Guardamos las URLs de las fotos como texto para que el Front pueda leerlas luego
            FotosRelacionadas: reporte.FotosUrls.join('; ')
        });

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: body,
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo guardar el reporte diario en la lista.");
        }
    }

    public async getHistorialGlobal(): Promise<any[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._metadataListName}')/items?$orderby=FechaRegistro desc`;

        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        if (!response.ok) return [];

        const data = await response.json();
        return data.value || [];
    }

    public async getFotosPorObra(obraId: number): Promise<any[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Registro_Fotos_Diarias')/items?$filter=ObraId eq ${obraId}&$orderby=FechaRegistro desc`;

        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    }


}