import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IMaterial } from '../models/IInventario';

export class StockService {
    private _context: WebPartContext;

    constructor(context: WebPartContext) {
        this._context = context;
    }

    // El Front-end solo llama a esta función y recibe los datos limpios
    public async getMateriales(): Promise<IMaterial[]> {
        const url = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
        const response = await this._context.spHttpClient.get(url, SPHttpClient.configurations.v1);
        const data = await response.json();
        
        return data.value.map((item: any) => ({
            id: item.Id,
            titulo: item.Title,
            stockActual: item.StockActual,
            categoria: item.Categoria
        }));
    }

    public async crearMaterial(nombre: string, stock: number): Promise<void> {
        const url = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
        const body = JSON.stringify({ 'Title': nombre, 'StockActual': stock });
        
        await this._context.spHttpClient.post(url, SPHttpClient.configurations.v1, { body });
    }
}