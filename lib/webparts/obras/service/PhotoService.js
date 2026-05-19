import { __awaiter, __generator } from "tslib";
import { SPHttpClient } from "@microsoft/sp-http";
var PhotoService = /** @class */ (function () {
    function PhotoService(context) {
        this._libName = "Fotos_Diario";
        this._metadataListName = "Registro_Fotos_Diarias";
        this._context = context;
    }
    PhotoService.prototype.subirFotoProyecto = function (file, nombreProyecto, metadatos) {
        return __awaiter(this, void 0, void 0, function () {
            var archivoOptimizado, siteUrl, serverRelativeUrl, nombreCarpeta, folderUrl, fileName, endpointFile, uploadOptions, uploadResponse, fileData, fotoUrlAbsoluta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._comprimirImagen(file)];
                    case 1:
                        archivoOptimizado = _a.sent();
                        siteUrl = this._context.pageContext.web.absoluteUrl;
                        serverRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
                        nombreCarpeta = nombreProyecto.replace(/[/\\?%*:|"<>]/g, "-");
                        folderUrl = "".concat(serverRelativeUrl, "/").concat(this._libName, "/").concat(nombreCarpeta);
                        // 1. Asegurar carpeta
                        return [4 /*yield*/, this._asegurarCarpeta(folderUrl)];
                    case 2:
                        // 1. Asegurar carpeta
                        _a.sent();
                        fileName = "".concat(Date.now(), "_").concat(metadatos.operarioId, "_").concat(encodeURIComponent(file.name));
                        endpointFile = "".concat(siteUrl, "/_api/web/getfolderbyserverrelativeurl('").concat(folderUrl, "')/files/add(url='").concat(fileName, "',overwrite=true)");
                        uploadOptions = {
                            body: file,
                            headers: {
                                Accept: "application/json;odata=nometadata",
                                "Content-type": file.type,
                                "odata-version": "3.0",
                            },
                        };
                        return [4 /*yield*/, this._context.spHttpClient.post(endpointFile, SPHttpClient.configurations.v1, uploadOptions)];
                    case 3:
                        uploadResponse = _a.sent();
                        if (!uploadResponse.ok)
                            throw new Error("Error al subir archivo.");
                        return [4 /*yield*/, uploadResponse.json()];
                    case 4:
                        fileData = _a.sent();
                        fotoUrlAbsoluta = "".concat(window.location.origin).concat(fileData.ServerRelativeUrl);
                        // 3. Registrar metadatos vinculados al ObraId
                        return [4 /*yield*/, this._registrarMetadatos(fotoUrlAbsoluta, nombreProyecto, metadatos)];
                    case 5:
                        // 3. Registrar metadatos vinculados al ObraId
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotoService.prototype._registrarMetadatos = function (url, proyecto, meta) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, body, response, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._metadataListName, "')/items");
                        body = {
                            Title: proyecto,
                            // Simplificamos el objeto URL para cumplir con la API de SharePoint
                            UrlFoto: {
                                Description: "Registro - ".concat(proyecto),
                                Url: url,
                            },
                            FechaRegistro: new Date().toISOString(),
                            OperarioId: meta.operarioId,
                            ObraId: meta.obraId,
                            Comentarios: meta.comentarios || "",
                        };
                        return [4 /*yield*/, this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
                                body: JSON.stringify(body),
                                headers: {
                                    Accept: "application/json;odata=nometadata",
                                    "Content-type": "application/json;odata=nometadata",
                                    "odata-version": "3.0",
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        err = _a.sent();
                        console.error("Error al registrar metadatos:", err);
                        throw new Error("No se pudo crear el registro.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PhotoService.prototype._asegurarCarpeta = function (folderUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var siteUrl, checkEndpoint, checkResponse, createEndpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteUrl = this._context.pageContext.web.absoluteUrl;
                        checkEndpoint = "".concat(siteUrl, "/_api/web/getfolderbyserverrelativeurl('").concat(folderUrl, "')");
                        return [4 /*yield*/, this._context.spHttpClient.get(checkEndpoint, SPHttpClient.configurations.v1)];
                    case 1:
                        checkResponse = _a.sent();
                        if (!(checkResponse.status === 404)) return [3 /*break*/, 3];
                        createEndpoint = "".concat(siteUrl, "/_api/web/folders");
                        return [4 /*yield*/, this._context.spHttpClient.post(createEndpoint, SPHttpClient.configurations.v1, {
                                body: JSON.stringify({ ServerRelativeUrl: folderUrl }),
                                headers: {
                                    Accept: "application/json;odata=nometadata",
                                    "Content-type": "application/json;odata=nometadata",
                                    "odata-version": "3.0",
                                },
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PhotoService.prototype.getFotosHoyPorOperario = function (operarioId) {
        return __awaiter(this, void 0, void 0, function () {
            var hoy, endpoint, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);
                        endpoint = "".concat(this._context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('").concat(this._metadataListName, "')/items?$filter=OperarioId eq ").concat(operarioId, " and FechaRegistro ge '").concat(hoy.toISOString(), "'&$orderby=FechaRegistro desc");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
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
    PhotoService.prototype.uploadCompressedPhoto = function (file, nombreProyecto, metadatos) {
        return __awaiter(this, void 0, void 0, function () {
            var compressedFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._comprimirImagen(file)];
                    case 1:
                        compressedFile = _a.sent();
                        // 2. Llamamos al método original con los 3 argumentos requeridos
                        return [2 /*return*/, this.subirFotoProyecto(compressedFile, nombreProyecto, metadatos)];
                }
            });
        });
    };
    PhotoService.prototype._comprimirImagen = function (file) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (event) {
                var img = new Image();
                img.src = event.target.result;
                img.onload = function () {
                    var canvas = document.createElement("canvas");
                    // Definimos un ancho máximo de 1200px para que se vea bien pero pese poco
                    var MAX_WIDTH = 1200;
                    var scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    var ctx = canvas.getContext("2d");
                    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(function (blob) {
                        // Devolvemos un nuevo archivo JPEG con calidad al 70%
                        resolve(new File([blob], file.name, { type: "image/jpeg" }));
                    }, "image/jpeg", 0.7);
                };
            };
        });
    };
    PhotoService.prototype.obtenerUbicacion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (!navigator.geolocation)
                            resolve(null);
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            return resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        }, function () { return resolve(null); }, { enableHighAccuracy: true, timeout: 5000 });
                    })];
            });
        });
    };
    return PhotoService;
}());
export { PhotoService };
//# sourceMappingURL=PhotoService.js.map