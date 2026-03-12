export interface IAsignacion {
    Id?: number;
    ObraId: number;
    PersonalId: number;
    FechaInicio: Date;
    FechaFinPrevista: Date;
    EstadoProgreso: number; // 0-100%
    // Para la funcionalidad de seguimiento, se podrían agregar campos adicionales como:
    FechaFinReal?: Date; // Fecha real de finalización
    Comentarios?: string; // Comentarios sobre el progreso o problemas encontrados
}