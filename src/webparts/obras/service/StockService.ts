import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IMaterial } from '../models/IMaterial';

export class StockService {
    private _context: WebPartContext;
    private _baseUrl: string;

    constructor(context: WebPartContext) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }

    /**
     * Obtiene todos los materiales del inventario
     */
    public async getInventario(): Promise<IMaterial[]> {
        // Seleccionamos los campos necesarios, incluyendo el campo de FotoMaterial
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items?$select=Id,Title,Categoria,StockActual,StockMinimo,FotoMaterial`;

        const response: SPHttpClientResponse = await this._context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
        );

        if (!response.ok) {
            throw new Error("Error al obtener el inventario");
        }

        const data = await response.json();
        
        // Mapeamos los datos de SharePoint al modelo IMaterial de TypeScript
        return data.value.map((item: any) => {
            return {
                Id: item.Id,
                Title: item.Title,
                Categoria: item.Categoria,
                StockActual: item.StockActual,
                StockMinimo: item.StockMinimo,
                FotoMaterial: item.FotoMaterial ? { Url: item.FotoMaterial.Url } : null
            } as IMaterial;
        });
    }

    /**
     * Actualiza la cantidad de stock de un material específico
     */
    public async actualizarStock(materialId: number, nuevaCantidad: number): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items(${materialId})`;
        
        const headers = {
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
        };

        const body = JSON.stringify({
            StockActual: nuevaCantidad
        });

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: headers,
            body: body
        });
    }

    /**
     * Crea un nuevo material con foto
     */
    public async crearMaterial(material: Partial<IMaterial>): Promise<void> {
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
        
        const body = JSON.stringify({
            Title: material.Title,
            Categoria: material.Categoria,
            StockActual: material.StockActual,
            StockMinimo: material.StockMinimo,
            // Si la columna en SharePoint es de tipo Imagen, se envía el objeto con la URL
            FotoMaterial: material.FotoMaterial ? JSON.stringify({ serverRelativeUrl: material.FotoMaterial.Url }) : null
        });

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: body
        });
    }
}