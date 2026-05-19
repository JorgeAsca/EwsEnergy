"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyReportService = void 0;
var tslib_1 = require("tslib");
var sp_http_1 = require("@microsoft/sp-http");
var DailyReportService = /** @class */ (function () {
    function DailyReportService(context) {
        this._metadataListName = "Registro_Fotos_Diarias";
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }
    /**
     * Guarda el reporte diario vinculando el texto con las URLs de las fotos
     */
    DailyReportService.prototype.guardarReporteDiario = function (reporte) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, body, response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('Diario de Trabajo')/items");
                        body = JSON.stringify({
                            Title: "Reporte - Obra ".concat(reporte.ObraId, " - ").concat(reporte.Fecha),
                            ObraId: reporte.ObraId,
                            Comentarios: reporte.Comentarios,
                            FotosRelacionadas: reporte.FotosUrls.join('; ')
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                                body: body,
                                headers: {
                                    "Accept": "application/json",
                                    "Content-type": "application/json"
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("No se pudo guardar el reporte diario.");
                        return [2 /*return*/];
                }
            });
        });
    };
    DailyReportService.prototype.getHistorialGlobal = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var campos, endpoint, response, data, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        campos = "Id,Title,Comentarios,FechaRegistro,OperarioId,ObraId,UrlFoto";
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('").concat(this._metadataListName, "')/items?$select=").concat(campos, "&$orderby=FechaRegistro desc");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, sp_http_1.SPHttpClient.configurations.v1)];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Error al obtener historial: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, data.value || []];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error en DailyReportService:", error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DailyReportService.prototype.getFotosPorObra = function (obraId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, response, data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('Registro_Fotos_Diarias')/items?$filter=ObraId eq ").concat(obraId, "&$orderby=FechaRegistro desc");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, sp_http_1.SPHttpClient.configurations.v1)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.value || []];
                }
            });
        });
    };
    return DailyReportService;
}());
exports.DailyReportService = DailyReportService;
//# sourceMappingURL=DailyReportService.js.map