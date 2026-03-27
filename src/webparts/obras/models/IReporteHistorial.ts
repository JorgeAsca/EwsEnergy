export interface IReporteHistorial {
    id: number;
    Tittle: string;
    Comentarios: string;
    FechaRegistro: string;
    OperarioId: number;
    ObraId: number;
    UrlFoto?:{
        Url: string;
        Description?: string;
    }

}