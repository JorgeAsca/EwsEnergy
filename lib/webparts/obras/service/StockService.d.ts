import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IMaterial } from '../models/IMaterial';
export declare class StockService {
    private _context;
    private _baseUrl;
    constructor(context: WebPartContext);
    private _getHeaders;
    getInventario(): Promise<IMaterial[]>;
    crearMaterial(material: any): Promise<void>;
    actualizarMaterial(id: number, material: any): Promise<void>;
    actualizarStock(materialId: number, nuevaCantidad: number): Promise<void>;
    eliminarMaterial(id: number): Promise<void>;
}
//# sourceMappingURL=StockService.d.ts.map