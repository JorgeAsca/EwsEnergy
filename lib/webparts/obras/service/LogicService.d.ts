export declare class LogicService {
    private _stockService;
    private _projectService;
    constructor(context: any);
    /**
     * Esta función automatiza el descuento de stock cuando se aprueba una obra
     */
    procesarSalidaDeMaterial(obraId: number, materialId: number, cantidad: number): Promise<void>;
    /**
     * Calcula la desviación de materiales (Presupuestado vs Real)
     */
    calcularDesviacion(presupuestado: number, real: number): number;
}
//# sourceMappingURL=LogicService.d.ts.map