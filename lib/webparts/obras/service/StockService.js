import { __assign, __awaiter, __generator } from "tslib";
import { SPHttpClient } from '@microsoft/sp-http';
var StockService = /** @class */ (function () {
    function StockService(context) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }
    StockService.prototype._getHeaders = function () {
        return {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': ''
        };
    };
    StockService.prototype.getInventario = function () {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('Inventario de Materiales')/items");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Error al obtener el inventario");
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.value.map(function (item) { return ({
                                Id: item.Id,
                                Title: item.Title,
                                Categoria: item.Categor_x00ed_a || "General",
                                StockActual: item.StockActual || 0,
                                StockMinimo: item.StockM_x00ed_nimo || 0
                            }); })];
                }
            });
        });
    };
    StockService.prototype.crearMaterial = function (material) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, body, response, errorRaw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('Inventario de Materiales')/items");
                        body = JSON.stringify({
                            Title: material.Title,
                            Categor_x00ed_a: material.Categoria,
                            StockActual: material.StockActual,
                            StockM_x00ed_nimo: material.StockMinimo
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: this._getHeaders(),
                                body: body
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorRaw = _a.sent();
                        throw new Error("Error en SharePoint: " + errorRaw);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StockService.prototype.actualizarMaterial = function (id, material) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, headers, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('Inventario de Materiales')/items(").concat(id, ")");
                        headers = __assign(__assign({}, this._getHeaders()), { 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' });
                        body = JSON.stringify({
                            Title: material.Title,
                            Categor_x00ed_a: material.Categoria,
                            StockActual: material.StockActual,
                            StockM_x00ed_nimo: material.StockMinimo
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, { headers: headers, body: body })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StockService.prototype.actualizarStock = function (materialId, nuevaCantidad) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('Inventario de Materiales')/items(").concat(materialId, ")");
                        headers = __assign(__assign({}, this._getHeaders()), { 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: headers,
                                body: JSON.stringify({ StockActual: nuevaCantidad })
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StockService.prototype.eliminarMaterial = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/lists/getbytitle('Inventario de Materiales')/items(").concat(id, ")");
                        headers = __assign(__assign({}, this._getHeaders()), { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, { headers: headers })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return StockService;
}());
export { StockService };
//# sourceMappingURL=StockService.js.map