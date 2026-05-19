import { __assign, __awaiter, __generator } from "tslib";
import { SPHttpClient } from "@microsoft/sp-http";
var ProjectService = /** @class */ (function () {
    function ProjectService(context) {
        this._listName = "Proyectos y Obras";
        this._context = context;
    }
    ProjectService.prototype.getObras = function () {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, response, errorText, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items?$select=Id,Title,Descripcion,DireccionObra,FechaInicio,FechaFinPrevista,EstadoObra,ProgresoReal,JornadasTotales,Cliente/Id,Cliente/Title&$expand=Cliente");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _a.sent();
                        console.error("Error en la petición a SharePoint:", errorText);
                        return [2 /*return*/, []];
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _a.sent();
                        return [2 /*return*/, data.value || []];
                    case 5:
                        error_1 = _a.sent();
                        console.error("Error al obtener obras:", error_1);
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.crearObra = function (nuevaObra) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items");
                        body = JSON.stringify({
                            Title: nuevaObra.Nombre,
                            ClienteId: nuevaObra.ClienteId,
                            DireccionObra: nuevaObra.Direccion,
                            FechaInicio: nuevaObra.FechaInicio,
                            FechaFinPrevista: nuevaObra.FechaFin,
                            JornadasTotales: nuevaObra.Jornadas,
                            EstadoObra: "Fase Previa",
                            ProgresoReal: 0,
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: {
                                    Accept: "application/json;odata=nometadata",
                                    "Content-type": "application/json;odata=nometadata",
                                    "odata-version": "",
                                },
                                body: body,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.updateObra = function (id, obraActualizada) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items(").concat(id, ")");
                        body = JSON.stringify({
                            Title: obraActualizada.Nombre,
                            ClienteId: obraActualizada.ClienteId,
                            DireccionObra: obraActualizada.Direccion,
                            FechaInicio: obraActualizada.FechaInicio,
                            FechaFinPrevista: obraActualizada.FechaFin,
                            JornadasTotales: obraActualizada.Jornadas,
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: {
                                    Accept: "application/json;odata=nometadata",
                                    "Content-type": "application/json;odata=nometadata",
                                    "odata-version": "",
                                    "IF-MATCH": "*",
                                    "X-HTTP-Method": "MERGE",
                                },
                                body: body,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.actualizarProgresoObra = function (id, nuevoProgreso) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._listName, "')/items(").concat(id, ")");
                        body = JSON.stringify({
                            ProgresoReal: nuevoProgreso,
                        });
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                headers: {
                                    Accept: "application/json;odata=nometadata",
                                    "Content-type": "application/json;odata=nometadata",
                                    "odata-version": "",
                                    "IF-MATCH": "*",
                                    "X-HTTP-Method": "MERGE",
                                },
                                body: body,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.actualizarEstado = function (id, nuevoEstado) {
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
                                body: JSON.stringify({
                                    // Asegúrate de que 'Estado' sea el nombre interno de tu columna en SharePoint
                                    Estado: nuevoEstado,
                                }),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.getFotosPorObra = function (obraId) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, response, errorText, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('Registro_Fotos_Diarias')/items?$filter=ObraId eq ").concat(obraId, "&$orderby=FechaRegistro desc");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _a.sent();
                        console.error("Error detallado de SharePoint:", errorText);
                        return [2 /*return*/, []];
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _a.sent();
                        return [2 /*return*/, data.value || []];
                    case 6:
                        e_1 = _a.sent();
                        console.error("Error de red:", e_1);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.getAsignacionesConPersonal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var siteUrl, endpoint, response, errorText, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteUrl = this._context.pageContext.web.absoluteUrl;
                        endpoint = "".concat(siteUrl, "/_api/web/lists/getbytitle('Asignaciones_Obras')/items?$select=Id,ObraId,Personal/NombreyApellido,Personal/FotoPerfil&$expand=Personal");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _a.sent();
                        console.error("Error al obtener asignaciones:", errorText);
                        return [2 /*return*/, []];
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _a.sent();
                        // Mapeamos los datos para que el componente Facepile los entienda fácilmente
                        return [2 /*return*/, (data.value || []).map(function (item) { return ({
                                Id: item.Id,
                                ObraId: item.ObraId,
                                Personal: {
                                    NombreyApellido: item.Personal
                                        ? item.Personal.NombreyApellido
                                        : "Sin nombre",
                                    FotoPerfil: item.Personal ? item.Personal.FotoPerfil : "",
                                },
                            }); })];
                    case 6:
                        error_2 = _a.sent();
                        console.error("Error en getAsignacionesConPersonal:", error_2);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.finalizarObra = function (id) {
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
                                body: JSON.stringify({
                                    EstadoObra: "Finalizado",
                                }),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.cancelarObra = function (id) {
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
                                body: JSON.stringify({
                                    EstadoObra: "Cancelado",
                                }),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectService.prototype.getObrasCompletas = function (asignaciones, personal) {
        return __awaiter(this, void 0, void 0, function () {
            var obras;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getObras()];
                    case 1:
                        obras = _a.sent();
                        return [2 /*return*/, obras.map(function (obra) {
                                var _a;
                                // Filtrar operarios asignados a esta obra
                                var asignados = asignaciones.filter(function (a) { return Number(a.ObraId) === Number(obra.Id); });
                                var operariosProps = asignados.map(function (asig) {
                                    var p = personal.find(function (pers) { return Number(pers.Id) === Number(asig.PersonalId); });
                                    return { personaName: p ? p.NombreyApellido : "Desconocido" };
                                });
                                return __assign(__assign({}, obra), { clienteNombre: ((_a = obra.Cliente) === null || _a === void 0 ? void 0 : _a.Title) || "Sin Cliente", porcentajeReal: obra.ProgresoReal || 0, operarios: operariosProps, jornadasConsumidas: Math.round(((obra.ProgresoReal || 0) / 100) * (obra.JornadasTotales || 30)) });
                            })];
                }
            });
        });
    };
    return ProjectService;
}());
export { ProjectService };
//# sourceMappingURL=ProjectService.js.map