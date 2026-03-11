export interface IMaterial {
    Id: number;
    Title: string; // Nombre del material
    Categoria: string;
    StockActual: number;
    StockMinimo: number;
    FotoMaterial?: {
        Url: string;
    };
}