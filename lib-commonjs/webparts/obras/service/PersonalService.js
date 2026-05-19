"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalService = void 0;
var tslib_1 = require("tslib");
var sp_http_1 = require("@microsoft/sp-http");
var PersonalService = /** @class */ (function () {
    function PersonalService(context) {
        this._listName = "Personal EWS";
        this._context = context;
    }
    PersonalService.prototype.getPersonal = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, response, data, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items?$select=Id,Title,Rol,FotoPerfil,Email");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                                headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '' }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, (data.value || []).map(function (item) { return ({
                                Id: item.Id,
                                NombreyApellido: item.Title,
                                Rol: item.Rol,
                                FotoPerfil: item.FotoPerfil ? item.FotoPerfil.Url : undefined,
                                Email: item.Email
                            }); })];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error en getPersonal:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtiene los archivos de la biblioteca 'Fotos_Personal' para elegirlos en el formulario
     */
    PersonalService.prototype.getFotosDisponibles = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var serverRelativeUrl, endpoint, response, errorText, data, files, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        serverRelativeUrl = "".concat(this._context.pageContext.web.serverRelativeUrl, "/Fotos_Personal");
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/getfolderbyserverrelativeurl('").concat(serverRelativeUrl, "')/files");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                                headers: {
                                    'Accept': 'application/json;odata=verbose',
                                    'odata-version': ''
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _a.sent();
                        console.error("Error al obtener archivos de la biblioteca:", errorText);
                        return [2 /*return*/, []];
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _a.sent();
                        files = data.d && data.d.results ? data.d.results : [];
                        return [2 /*return*/, files.map(function (file) { return ({
                                key: "".concat(window.location.origin).concat(file.ServerRelativeUrl),
                                text: file.Name,
                                url: "".concat(window.location.origin).concat(file.ServerRelativeUrl)
                            }); })];
                    case 5:
                        error_2 = _a.sent();
                        console.error("Error obteniendo fotos de la biblioteca:", error_2);
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PersonalService.prototype.crearTrabajador = function (nuevo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, body, response, err;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items");
                        body = {
                            Title: nuevo.NombreyApellido,
                            Rol: nuevo.Rol,
                            FotoPerfil: nuevo.FotoPerfil ? {
                                Description: nuevo.NombreyApellido,
                                Url: nuevo.FotoPerfil
                            } : null
                        };
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                                headers: {
                                    'Accept': 'application/json;odata=nometadata',
                                    'Content-type': 'application/json;odata=nometadata',
                                    'odata-version': '3.0'
                                },
                                body: JSON.stringify(body)
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        err = _a.sent();
                        console.error("Detalle del error al crear ítem:", err);
                        throw new Error("No se pudo crear el registro del personal.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PersonalService.prototype.getRolOptions = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, response, data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/fields?$filter=EntityPropertyName eq 'Rol'");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, sp_http_1.SPHttpClient.configurations.v1)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, (data.value && data.value[0]) ? data.value[0].Choices : []];
                }
            });
        });
    };
    PersonalService.prototype.actualizarTrabajador = function (id, datos) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, body, response, errorText;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items(").concat(id, ")");
                        body = JSON.stringify({
                            '__metadata': { 'type': "SP.Data.Personal_x0020_EWSListItem" },
                            Title: datos.NombreyApellido,
                            Rol: datos.Rol,
                            FotoPerfil: datos.FotoPerfil ? {
                                '__metadata': { 'type': 'SP.FieldUrlValue' },
                                'Description': datos.NombreyApellido,
                                'Url': datos.FotoPerfil
                            } : null
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                                body: body,
                                headers: {
                                    'Accept': 'application/json;odata=verbose',
                                    'Content-type': 'application/json;odata=verbose',
                                    'X-HTTP-Method': 'MERGE',
                                    'IF-MATCH': '*',
                                    'odata-version': ''
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _a.sent();
                        console.error("Error detallado al actualizar:", errorText);
                        // Si el error persiste por el nombre del tipo, probaremos una versión más simplificada
                        throw new Error("No se pudo actualizar el registro del trabajador.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PersonalService.prototype.eliminarTrabajador = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpoint, response, errorText;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items(").concat(id, ")");
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-HTTP-Method': 'DELETE',
                                    'IF-MATCH': '*'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _a.sent();
                        console.error("Error al eliminar de SharePoint:", errorText);
                        throw new Error("No se pudo eliminar el registro.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PersonalService;
}());
exports.PersonalService = PersonalService;
//# sourceMappingURL=PersonalService.js.map