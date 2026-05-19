import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IReporteHistorial } from "../models/IReporteHistorial";
import { IDiarioEntrada } from "../models/IDiarioEntrada";
export declare class DailyReportService {
    private _context;
    private _baseUrl;
    private _metadataListName;
    constructor(context: WebPartContext);
    /**
     * Guarda el reporte diario vinculando el texto con las URLs de las fotos
     */
    guardarReporteDiario(reporte: IDiarioEntrada): Promise<void>;
    getHistorialGlobal(): Promise<IReporteHistorial[]>;
    getFotosPorObra(obraId: number): Promise<any[]>;
}
//# sourceMappingURL=DailyReportService.d.ts.map