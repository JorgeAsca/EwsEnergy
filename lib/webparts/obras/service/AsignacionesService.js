import { __awaiter, __generator } from "tslib";
import { SPHttpClient } from "@microsoft/sp-http";
import { ProjectService } from "./ProjectService";
import { PersonalService } from "./PersonalService";
var AsignacionesService = /** @class */ (function () {
    function AsignacionesService(context) {
        this._listName = "Asignaciones EWS";
        this._context = context;
    }
    //Metodo para cargar los datos de una soloza vez
    AsignacionesService.prototype.getDatosPanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var projectService, personalService, _a, obras, personal, asignaciones;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        projectService = new ProjectService(this._context);
                        personalService = new PersonalService(this._context);
                        return [4 /*yield*/, Promise.all([
                                projectService.getObras(),
                                personalService.getPersonal(),
                                this.getAsignaciones(),
                            ])];
                    case 1:
                        _a = _b.sent(), obras = _a[0], personal = _a[1], asignaciones = _a[2];
                        return [2 /*return*/, { obras: obras, personal: personal, asignaciones: asignaciones }];
                }
            });
        });
    };
    AsignacionesService.prototype.getAsignaciones = function () {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.value || []];
                }
            });
        });
    };
    AsignacionesService.prototype.getObrasActivas = function () {
        return __awaiter(this, void 0, void 0, function () {
            var projectService, obras;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectService = new ProjectService(this._context);
                        return [4 /*yield*/, projectService.getObras()];
                    case 1:
                        obras = _a.sent();
                        return [2 /*return*/, obras.filter(function (o) { return o.EstadoObra !== "Finalizado"; })];
                }
            });
        });
    };
    AsignacionesService.prototype.getPersonalDisponible = function () {
        return __awaiter(this, void 0, void 0, function () {
            var personalService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        personalService = new PersonalService(this._context);
                        return [4 /*yield*/, personalService.getPersonal()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AsignacionesService.prototype.calcularSemaforoAsignacion = function (fechaFinStr) {
        if (!fechaFinStr)
            return { label: "Sin fecha", presence: 0 };
        var hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        var fin = new Date(fechaFinStr);
        fin.setHours(0, 0, 0, 0);
        if (fin.getTime() < hoy.getTime()) {
            return { label: "Finalizado / Concluido", presence: 4 };
        }
        else if (fin.getTime() === hoy.getTime()) {
            return { label: "Asiste Hoy", presence: 3 };
        }
        else {
            return { label: "Programado Próximamente", presence: 2 };
        }
    };
    // Creación encapsulada en el servicio
    AsignacionesService.prototype.crearAsignacion = function (obraId, personalId, fechaFin) {
        return __awaiter(this, void 0, void 0, function () {
            var body, options, endpoint, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = {
                            Title: "Asignaci\u00F3n Obra ".concat(obraId),
                            ObraId: obraId,
                            PersonalId: personalId,
                            FechaInicio: new Date().toISOString(),
                            FechaFinPrevista: fechaFin.toISOString(),
                            EstadoProgreso: 0,
                        };
                        options = {
                            headers: {
                                Accept: "application/json;odata=nometadata",
                                "content-type": "application/json;odata=nometadata",
                                "odata-version": "3.0",
                            },
                            body: JSON.stringify(body),
                        };
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items");
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Error al guardar en SharePoint");
                        return [2 /*return*/];
                }
            });
        });
    };
    AsignacionesService.prototype.asignarPersonal = function (asignacion) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, body, options, response, error;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items");
                        body = {
                            Title: "Asignaci\u00F3n Obra ".concat(asignacion.ObraId),
                            ObraId: asignacion.ObraId,
                            PersonalId: asignacion.PersonalId,
                            FechaInicio: asignacion.FechaInicio ? new Date(asignacion.FechaInicio).toISOString() : new Date().toISOString(),
                            FechaFinPrevista: asignacion.FechaFinPrevista ? new Date(asignacion.FechaFinPrevista).toISOString() : new Date().toISOString(),
                            EstadoProgreso: (_a = asignacion.EstadoProgreso) !== null && _a !== void 0 ? _a : 0,
                        };
                        options = {
                            headers: {
                                Accept: "application/json;odata=nometadata",
                                "Content-type": "application/json;odata=nometadata",
                                "odata-version": "3.0",
                            },
                            body: JSON.stringify(body),
                        };
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options)];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _b.sent();
                        console.error("Detalle del error:", error);
                        throw new Error("Error al guardar en SharePoint");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AsignacionesService.prototype.eliminarAsignacion = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, response, errorText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('Asignaciones EWS')/items(").concat(id, ")");
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: {
                                    Accept: "application/json",
                                    "Content-type": "application/json",
                                    "X-HTTP-Method": "DELETE",
                                    "IF-MATCH": "*",
                                    "odata-version": "3.0",
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _a.sent();
                        console.error("Error detallado de SharePoint:", errorText);
                        throw new Error("No se pudo eliminar: ".concat(response.statusText));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AsignacionesService.prototype.actualizarAsignacion = function (id, datos) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items(").concat(id, ")");
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: {
                                    Accept: "application/json",
                                    "Content-type": "application/json",
                                    "X-HTTP-Method": "MERGE",
                                    "IF-MATCH": "*",
                                    "odata-version": "",
                                },
                                body: JSON.stringify(datos),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AsignacionesService.prototype.getCuadrillaSugerida = function (obraId, operarioId, asignaciones, personal) {
        var idsEnObra = asignaciones
            .filter(function (a) { return Number(a.ObraId) === Number(obraId); })
            .map(function (a) { return Number(a.PersonalId); });
        return personal.filter(function (p) { return idsEnObra.indexOf(Number(p.Id)) !== -1 && p.Id !== operarioId; });
    };
    return AsignacionesService;
}());
export { AsignacionesService };
//# sourceMappingURL=AsignacionesService.js.map