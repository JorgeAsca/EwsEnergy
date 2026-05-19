import { WebPartContext } from "@microsoft/sp-webpart-base";
export declare class PhotoService {
    private _context;
    private _libName;
    private _metadataListName;
    constructor(context: WebPartContext);
    subirFotoProyecto(file: File, nombreProyecto: string, metadatos: {
        operario: string;
        operarioId: number;
        obraId: number;
        comentarios?: string;
    }): Promise<void>;
    private _registrarMetadatos;
    private _asegurarCarpeta;
    getFotosHoyPorOperario(operarioId: number): Promise<any[]>;
    uploadCompressedPhoto(file: File, nombreProyecto: string, metadatos: {
        operario: string;
        operarioId: number;
        obraId: number;
        comentarios?: string;
        latitud?: number;
        longitud?: number;
    }): Promise<void>;
    private _comprimirImagen;
    obtenerUbicacion(): Promise<{
        lat: number;
        lng: number;
    } | null>;
}
//# sourceMappingURL=PhotoService.d.ts.map