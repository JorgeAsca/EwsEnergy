import { __awaiter, __generator } from "tslib";
import { StockService } from './StockService';
import { ProjectService } from './ProjectService';
var LogicService = /** @class */ (function () {
    function LogicService(context) {
        this._stockService = new StockService(context);
        this._projectService = new ProjectService(context);
    }
    /**
     * Esta función automatiza el descuento de stock cuando se aprueba una obra
     */
    LogicService.prototype.procesarSalidaDeMaterial = function (obraId, materialId, cantidad) {
        return __awaiter(this, void 0, void 0, function () {
            var inventario, material, nuevoStock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._stockService.getInventario()];
                    case 1:
                        inventario = _a.sent();
                        material = inventario.find(function (m) { return m.Id === materialId; });
                        if (!material) return [3 /*break*/, 4];
                        nuevoStock = material.StockActual - cantidad;
                        // 2. Si el stock es insuficiente, lanzamos un error (regla de negocio)
                        if (nuevoStock < 0) {
                            throw new Error("No hay stock suficiente en el almacén para esta obra.");
                        }
                        // 3. Actualizamos el stock en SharePoint
                        return [4 /*yield*/, this._stockService.actualizarStock(materialId, nuevoStock)];
                    case 2:
                        // 3. Actualizamos el stock en SharePoint
                        _a.sent();
                        // 4. Cambiamos el estado de la obra a 'STOCK ALMACEN'
                        return [4 /*yield*/, this._projectService.actualizarEstado(obraId, 'STOCK ALMACEN')];
                    case 3:
                        // 4. Cambiamos el estado de la obra a 'STOCK ALMACEN'
                        _a.sent();
                        console.log("Proceso completado: Se descontaron ".concat(cantidad, " unidades de ").concat(material.Title));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calcula la desviación de materiales (Presupuestado vs Real)
     */
    LogicService.prototype.calcularDesviacion = function (presupuestado, real) {
        // Retorna el porcentaje de desviación
        if (presupuestado === 0)
            return 0;
        return ((real - presupuestado) / presupuestado) * 100;
    };
    return LogicService;
}());
export { LogicService };
//# sourceMappingURL=LogicService.js.map