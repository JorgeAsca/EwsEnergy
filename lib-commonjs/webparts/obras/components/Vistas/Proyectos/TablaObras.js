"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablaObras = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var sp_http_1 = require("@microsoft/sp-http");
var ProjectService_1 = require("../../../service/ProjectService");
var PersonalService_1 = require("../../../service/PersonalService");
var AsignacionesService_1 = require("../../../service/AsignacionesService");
var TablaObras_module_scss_1 = tslib_1.__importDefault(require("./TablaObras.module.scss"));
var TablaObras = function (props) {
    var _a;
    // --- ESTADOS DE DATOS ---
    var _b = React.useState([]), obras = _b[0], setObras = _b[1];
    var _c = React.useState([]), clientes = _c[0], setClientes = _c[1];
    var _d = React.useState(null), obraSeleccionada = _d[0], setObraSeleccionada = _d[1];
    var _e = React.useState([]), fotosObra = _e[0], setFotosObra = _e[1];
    // --- ESTADOS DE CONTROL ---
    var _f = React.useState(true), loading = _f[0], setLoading = _f[1];
    var _g = React.useState(false), loadingFotos = _g[0], setLoadingFotos = _g[1];
    var _h = React.useState(false), isOpen = _h[0], setIsOpen = _h[1];
    var _j = React.useState(false), saving = _j[0], setSaving = _j[1];
    var _k = React.useState(false), isProcessing = _k[0], setIsProcessing = _k[1];
    var _l = React.useState(null), obraEditandoId = _l[0], setObraEditandoId = _l[1];
    // --- ESTADO DE FORMULARIO ---
    var _m = React.useState({
        Nombre: "",
        Descripcion: "",
        ClienteId: 0,
        Direccion: "",
        FechaInicio: new Date(),
        FechaFin: new Date(),
        JornadasTotales: 30,
    }), nuevaObra = _m[0], setNuevaObra = _m[1];
    // --- SERVICIOS MEMOIZADOS ---
    var services = React.useMemo(function () { return ({
        project: new ProjectService_1.ProjectService(props.context),
        personal: new PersonalService_1.PersonalService(props.context),
        asig: new AsignacionesService_1.AsignacionesService(props.context)
    }); }, [props.context]);
    // --- LÓGICA DE CARGA CENTRALIZADA ---
    var cargarTodo = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var _a, listaObras, respClientes, listaAsignaciones_1, listaPersonal_1, opcionesClientes_1, dataC, obrasProcesadas, actualizada, e_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            services.project.getObras(),
                            props.context.spHttpClient.get("".concat(props.context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('Clientes')/items?$select=Id,Title"), sp_http_1.SPHttpClient.configurations.v1),
                            services.asig.getAsignaciones(),
                            services.personal.getPersonal(),
                        ])];
                case 1:
                    _a = _b.sent(), listaObras = _a[0], respClientes = _a[1], listaAsignaciones_1 = _a[2], listaPersonal_1 = _a[3];
                    opcionesClientes_1 = [];
                    if (!respClientes.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, respClientes.json()];
                case 2:
                    dataC = _b.sent();
                    opcionesClientes_1 = (dataC.value || []).map(function (c) { return ({ key: c.Id, text: c.Title }); });
                    setClientes(opcionesClientes_1);
                    _b.label = 3;
                case 3:
                    obrasProcesadas = listaObras.map(function (o) {
                        var _a;
                        var porcentajeReal = (o.ProgresoReal || 0) / 100;
                        var asigsObra = listaAsignaciones_1.filter(function (a) { return Number(a.ObraId) === Number(o.Id); });
                        var operariosAsignados = Array.from(new Set(asigsObra.map(function (a) { return Number(a.PersonalId); })))
                            .map(function (pid) {
                            var pers = listaPersonal_1.find(function (p) { return Number(p.Id) === pid; });
                            return {
                                personaName: (pers === null || pers === void 0 ? void 0 : pers.NombreyApellido) || "Operario",
                                imageUrl: (pers === null || pers === void 0 ? void 0 : pers.FotoPerfil) || "",
                            };
                        });
                        return tslib_1.__assign(tslib_1.__assign({}, o), { clienteNombre: ((_a = opcionesClientes_1.find(function (c) { var _a; return Number(c.key) === ((_a = o.Cliente) === null || _a === void 0 ? void 0 : _a.Id); })) === null || _a === void 0 ? void 0 : _a.text) || "Cliente no definido", porcentajeReal: Math.min(Math.max(porcentajeReal, 0), 1), operarios: operariosAsignados, jornadasConsumidas: parseFloat((porcentajeReal * (o.JornadasTotales || 30)).toFixed(1)) });
                    });
                    setObras(obrasProcesadas);
                    // Actualizar selección actual si existe
                    if (obraSeleccionada) {
                        actualizada = obrasProcesadas.find(function (o) { return o.Id === obraSeleccionada.Id; });
                        if (actualizada)
                            setObraSeleccionada(actualizada);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _b.sent();
                    console.error("Error en Dashboard:", e_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () { cargarTodo(); }, []);
    // --- MANEJADORES DE ACCIONES ---
    var verDetallesObra = function (obra) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var fotos, e_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setObraSeleccionada(obra);
                    setLoadingFotos(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, services.project.getFotosPorObra(obra.Id)];
                case 2:
                    fotos = _a.sent();
                    setFotosObra(fotos || []);
                    return [3 /*break*/, 5];
                case 3:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingFotos(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleGuardar = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var e_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!nuevaObra.Nombre || !nuevaObra.ClienteId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    setSaving(true);
                    if (!obraEditandoId) return [3 /*break*/, 3];
                    return [4 /*yield*/, services.project.updateObra(obraEditandoId, nuevaObra)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, services.project.crearObra(nuevaObra)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    setIsOpen(false);
                    resetForm();
                    return [4 /*yield*/, cargarTodo()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    e_3 = _a.sent();
                    alert("Error al guardar los cambios.");
                    return [3 /*break*/, 9];
                case 8:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var resetForm = function () {
        setObraEditandoId(null);
        setNuevaObra({
            Nombre: "", Descripcion: "", ClienteId: 0, Direccion: "",
            FechaInicio: new Date(), FechaFin: new Date(), JornadasTotales: 30,
        });
    };
    var handleAccionObra = function (id, accion) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var confirmacion, endpoint, e_4;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    confirmacion = {
                        finalizar: "¿Estás seguro de finalizar esta obra?",
                        cancelar: "¿Deseas cancelar esta obra? No aparecerá activa.",
                        eliminar: "⚠️ ¿ESTÁS SEGURO? Se borrarán todos los registros permanentemente."
                    };
                    if (!window.confirm(confirmacion[accion]))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, 10, 11]);
                    setIsProcessing(true);
                    if (!(accion === 'finalizar')) return [3 /*break*/, 3];
                    return [4 /*yield*/, services.project.finalizarObra(id)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!(accion === 'cancelar')) return [3 /*break*/, 5];
                    return [4 /*yield*/, services.project.cancelarObra(id)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!(accion === 'eliminar')) return [3 /*break*/, 7];
                    endpoint = "".concat(props.context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('Proyectos y Obras')/items(").concat(id, ")");
                    return [4 /*yield*/, props.context.spHttpClient.post(endpoint, sp_http_1.SPHttpClient.configurations.v1, {
                            headers: { 'Accept': 'application/json', 'IF-MATCH': '*', 'X-HTTP-Method': 'DELETE' }
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    setObraSeleccionada(null);
                    return [4 /*yield*/, cargarTodo()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 9:
                    e_4 = _a.sent();
                    console.error("Error en ".concat(accion, ":"), e_4);
                    return [3 /*break*/, 11];
                case 10:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    // --- RENDERIZADO DE APOYO ---
    var renderProgressTracker = function (pReal) {
        var totalBoxes = 10;
        var filledBoxes = Math.round(pReal * totalBoxes);
        return (React.createElement("div", { className: TablaObras_module_scss_1.default.progressTrackerBox, title: "Avance: ".concat((pReal * 100).toFixed(0), "%") }, Array.from({ length: totalBoxes }).map(function (_, idx) { return (React.createElement("div", { key: idx, className: "".concat(TablaObras_module_scss_1.default.trackerDot, " ").concat(idx < filledBoxes ? TablaObras_module_scss_1.default.filledOnTrack : "") })); })));
    };
    var obrasAgrupadas = obras.reduce(function (acc, obra) {
        var estado = obra.EstadoObra || "Sin Asignar";
        if (!acc[estado])
            acc[estado] = [];
        acc[estado].push(obra);
        return acc;
    }, {});
    if (loading && obras.length === 0)
        return React.createElement(react_1.Spinner, { size: react_1.SpinnerSize.large, label: "Sincronizando Dashboard EWS..." });
    return (React.createElement("div", { className: TablaObras_module_scss_1.default.container },
        React.createElement("div", { className: TablaObras_module_scss_1.default.headerSection },
            React.createElement(react_1.Stack, null,
                React.createElement(react_1.Text, { variant: "xxLarge", className: TablaObras_module_scss_1.default.tituloPrincipal }, "Panel de Control de Obras"),
                React.createElement(react_1.Text, { variant: "small", className: TablaObras_module_scss_1.default.subtituloHeader }, "Gesti\u00F3n y seguimiento EWS Energy")),
            React.createElement(react_1.PrimaryButton, { iconProps: { iconName: "Add" }, text: "Nueva Obra", onClick: function () { resetForm(); setIsOpen(true); }, className: TablaObras_module_scss_1.default.btnNuevaObra })),
        React.createElement("div", { className: TablaObras_module_scss_1.default.splitLayout },
            React.createElement("div", { className: TablaObras_module_scss_1.default.listColumn },
                React.createElement("div", { className: TablaObras_module_scss_1.default.listContainer },
                    Object.keys(obrasAgrupadas).length === 0 && React.createElement(react_1.MessageBar, null, "No hay proyectos registrados."),
                    Object.keys(obrasAgrupadas).map(function (estado) { return (React.createElement("div", { key: estado },
                        React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.listGroupHeader }, estado),
                        obrasAgrupadas[estado].map(function (o) { return (React.createElement("div", { key: o.Id, className: "".concat(TablaObras_module_scss_1.default.listItem, " ").concat((obraSeleccionada === null || obraSeleccionada === void 0 ? void 0 : obraSeleccionada.Id) === o.Id ? TablaObras_module_scss_1.default.selected : ""), onClick: function () { return verDetallesObra(o); } },
                            React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.obraTitle }, o.Title),
                            renderProgressTracker(o.porcentajeReal))); }))); }))),
            React.createElement("div", { className: TablaObras_module_scss_1.default.detailColumn }, obraSeleccionada ? (React.createElement("div", { className: TablaObras_module_scss_1.default.detailContent },
                React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center" },
                    React.createElement(react_1.Stack, null,
                        React.createElement(react_1.Text, { variant: "xLarge", className: TablaObras_module_scss_1.default.detailTitle }, obraSeleccionada.Title),
                        React.createElement(react_1.Text, { variant: "small", style: { color: "#666" } }, obraSeleccionada.clienteNombre)),
                    React.createElement("div", { className: "".concat(TablaObras_module_scss_1.default.badgeEstado, " ").concat(obraSeleccionada.EstadoObra === "Finalizado" ? TablaObras_module_scss_1.default.finalizado : obraSeleccionada.EstadoObra === "Cancelado" ? TablaObras_module_scss_1.default.cancelado : TablaObras_module_scss_1.default.activo) }, obraSeleccionada.EstadoObra || "Fase Previa"),
                    React.createElement(react_1.DefaultButton, { iconProps: { iconName: "Edit" }, text: "Editar", onClick: function () {
                            var _a;
                            setObraEditandoId(obraSeleccionada.Id);
                            setNuevaObra({
                                Nombre: obraSeleccionada.Title, Descripcion: obraSeleccionada.Descripcion || "",
                                ClienteId: ((_a = clientes.find(function (c) { return c.text === obraSeleccionada.clienteNombre; })) === null || _a === void 0 ? void 0 : _a.key) || 0,
                                Direccion: obraSeleccionada.DireccionObra || "",
                                FechaInicio: new Date(obraSeleccionada.FechaInicio || Date.now()),
                                FechaFin: new Date(obraSeleccionada.FechaFinPrevista || Date.now()),
                                JornadasTotales: obraSeleccionada.JornadasTotales || 30
                            });
                            setIsOpen(true);
                        } })),
                React.createElement(react_1.Separator, null),
                React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 40 }, className: TablaObras_module_scss_1.default.infoSection },
                    React.createElement(react_1.Stack, null,
                        React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.labelSeccion }, "Direcci\u00F3n"),
                        React.createElement(react_1.Text, null,
                            React.createElement(react_1.Icon, { iconName: "MapPin", className: TablaObras_module_scss_1.default.iconVerde }),
                            " ",
                            obraSeleccionada.DireccionObra || "Sin dirección")),
                    React.createElement(react_1.Stack, null,
                        React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.labelSeccion }, "Jornadas Consumidas"),
                        React.createElement(react_1.Text, null,
                            React.createElement(react_1.Icon, { iconName: "Calendar", className: TablaObras_module_scss_1.default.iconVerde }),
                            " ",
                            obraSeleccionada.jornadasConsumidas,
                            " / ",
                            obraSeleccionada.JornadasTotales || 30)),
                    React.createElement(react_1.Stack, null,
                        React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.labelSeccion }, "Avance F\u00EDsico"),
                        React.createElement(react_1.Text, null,
                            React.createElement(react_1.Icon, { iconName: "CompletedSolid", className: TablaObras_module_scss_1.default.iconVerde }),
                            " ",
                            (obraSeleccionada.porcentajeReal * 100).toFixed(0),
                            "% Ejecutado")),
                    React.createElement(react_1.Stack, null,
                        React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.labelSeccion }, "Equipo en Campo"),
                        ((_a = obraSeleccionada.operarios) === null || _a === void 0 ? void 0 : _a.length) > 0 ? (React.createElement(react_1.Facepile, { personas: obraSeleccionada.operarios, personaSize: react_1.PersonaSize.size32 })) : React.createElement(react_1.Text, { variant: "small", style: { fontStyle: "italic", color: "#888" } }, "Sin personal asignado"))),
                React.createElement("div", { className: TablaObras_module_scss_1.default.planosSection },
                    React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center", styles: { root: { marginBottom: 15 } } },
                        React.createElement(react_1.Text, { variant: "large", className: TablaObras_module_scss_1.default.sectionTitle }, "Planos y Documentaci\u00F3n"),
                        React.createElement(react_1.DefaultButton, { iconProps: { iconName: "Upload" }, className: TablaObras_module_scss_1.default.btnUpload }, "A\u00F1adir Archivo")),
                    React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 15 }, wrap: true },
                        React.createElement("div", { className: TablaObras_module_scss_1.default.planoCard },
                            React.createElement(react_1.Icon, { iconName: "PDF", className: TablaObras_module_scss_1.default.pdfIcon }),
                            React.createElement(react_1.Text, { variant: "smallPlus" }, "Esquema_El\u00E9ctrico_v2.pdf")),
                        React.createElement("div", { className: TablaObras_module_scss_1.default.planoCard },
                            React.createElement(react_1.Icon, { iconName: "VisioDocument", className: TablaObras_module_scss_1.default.dwgIcon }),
                            React.createElement(react_1.Text, { variant: "smallPlus" }, "Topograf\u00EDa_Terreno.dwg")))),
                React.createElement("div", { className: TablaObras_module_scss_1.default.historialSection },
                    React.createElement(react_1.Text, { variant: "large", className: TablaObras_module_scss_1.default.sectionTitle }, "Reportes de Jornada"),
                    loadingFotos ? React.createElement(react_1.Spinner, { size: react_1.SpinnerSize.large, label: "Cargando reportes..." }) :
                        fotosObra.length > 0 ? (React.createElement(react_1.Stack, { tokens: { childrenGap: 15 }, styles: { root: { marginTop: 15 } } }, fotosObra.map(function (f, i) {
                            var _a;
                            return (React.createElement("div", { key: i, className: TablaObras_module_scss_1.default.fotoCard },
                                React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 15 } },
                                    React.createElement(react_1.Image, { src: (_a = f.UrlFoto) === null || _a === void 0 ? void 0 : _a.Url, width: 120, height: 90, imageFit: react_1.ImageFit.cover, className: TablaObras_module_scss_1.default.fotoThumb }),
                                    React.createElement(react_1.Stack, null,
                                        React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.fotoFecha },
                                            "\uD83D\uDCC5 ",
                                            new Date(f.FechaRegistro).toLocaleDateString(),
                                            " - Worker ",
                                            f.Operario),
                                        React.createElement("div", { className: TablaObras_module_scss_1.default.fotoComentarioBox },
                                            React.createElement(react_1.Text, { className: TablaObras_module_scss_1.default.fotoComentarioText },
                                                "\"",
                                                f.Comentarios || "Sin observaciones técnicas",
                                                "\""))))));
                        }))) : React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.info }, "No hay reportes para esta obra.")),
                React.createElement("div", { className: TablaObras_module_scss_1.default.planosSection },
                    React.createElement(react_1.Separator, null),
                    React.createElement(react_1.Stack, { tokens: { childrenGap: 15 }, style: { marginTop: '20px' } },
                        React.createElement(react_1.Text, { variant: "large", className: TablaObras_module_scss_1.default.sectionTitle }, "Gesti\u00F3n de Obra"),
                        React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 12 }, verticalAlign: "center" }, isProcessing ? React.createElement(react_1.Spinner, { label: "Procesando..." }) : (React.createElement(React.Fragment, null,
                            React.createElement(react_1.PrimaryButton, { text: "Finalizar Obra", iconProps: { iconName: 'Completed' }, onClick: function () { return handleAccionObra(obraSeleccionada.Id, 'finalizar'); }, className: TablaObras_module_scss_1.default.btnNuevaObra }),
                            React.createElement(react_1.DefaultButton, { text: "Cancelar Obra", iconProps: { iconName: 'Clear' }, onClick: function () { return handleAccionObra(obraSeleccionada.Id, 'cancelar'); } }),
                            React.createElement(react_1.IconButton, { iconProps: { iconName: 'Delete' }, title: "Eliminar Obra", onClick: function () { return handleAccionObra(obraSeleccionada.Id, 'eliminar'); }, className: TablaObras_module_scss_1.default.btnClose })))))))) : (React.createElement("div", { className: TablaObras_module_scss_1.default.emptyState },
                React.createElement(react_1.Icon, { iconName: "ProjectCollection", className: TablaObras_module_scss_1.default.emptyIcon }),
                React.createElement(react_1.Text, { variant: "xLarge" }, "Selecciona una obra"),
                React.createElement(react_1.Text, { variant: "medium" }, "Pincha en un proyecto de la lista para ver su informaci\u00F3n detallada."))))),
        React.createElement(react_1.Modal, { isOpen: isOpen, onDismiss: function () { return setIsOpen(false); }, containerClassName: TablaObras_module_scss_1.default.modalFlotanteContainer },
            React.createElement("div", { className: TablaObras_module_scss_1.default.modalContent },
                React.createElement("div", { className: TablaObras_module_scss_1.default.modalHeader },
                    React.createElement(react_1.Text, { variant: "xLarge", className: TablaObras_module_scss_1.default.modalTitle }, obraEditandoId ? "Editar Proyecto" : "Configurar Nuevo Proyecto"),
                    React.createElement(react_1.IconButton, { iconProps: { iconName: "Cancel" }, onClick: function () { return setIsOpen(false); }, className: TablaObras_module_scss_1.default.btnClose })),
                React.createElement(react_1.Separator, { className: TablaObras_module_scss_1.default.modalSeparator }),
                React.createElement("div", { className: TablaObras_module_scss_1.default.modalBody },
                    React.createElement(react_1.Stack, { tokens: { childrenGap: 15 } },
                        React.createElement(react_1.TextField, { label: "Nombre del Proyecto", required: true, value: nuevaObra.Nombre, onChange: function (_, v) { return setNuevaObra(tslib_1.__assign(tslib_1.__assign({}, nuevaObra), { Nombre: v || "" })); } }),
                        React.createElement(react_1.Dropdown, { label: "Cliente", required: true, options: clientes, selectedKey: nuevaObra.ClienteId, onChange: function (_, opt) { return setNuevaObra(tslib_1.__assign(tslib_1.__assign({}, nuevaObra), { ClienteId: opt === null || opt === void 0 ? void 0 : opt.key })); } }),
                        React.createElement(react_1.TextField, { label: "Direcci\u00F3n de Obra", value: nuevaObra.Direccion, onChange: function (_, v) { return setNuevaObra(tslib_1.__assign(tslib_1.__assign({}, nuevaObra), { Direccion: v || "" })); } }),
                        React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 20 } },
                            React.createElement(react_1.TextField, { label: "Jornadas Presupuestadas", type: "number", required: true, value: nuevaObra.JornadasTotales.toString(), onChange: function (_, v) { return setNuevaObra(tslib_1.__assign(tslib_1.__assign({}, nuevaObra), { JornadasTotales: parseInt(v || "0") })); }, styles: { root: { flex: 1 } } }),
                            React.createElement(react_1.DatePicker, { label: "Fecha Inicio", value: nuevaObra.FechaInicio, onSelectDate: function (d) { return setNuevaObra(tslib_1.__assign(tslib_1.__assign({}, nuevaObra), { FechaInicio: d || new Date() })); }, styles: { root: { flex: 1 } } })))),
                React.createElement("div", { className: TablaObras_module_scss_1.default.modalFooter },
                    React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 10 }, horizontalAlign: "end" }, saving ? React.createElement(react_1.Spinner, { label: "Guardando..." }) : (React.createElement(React.Fragment, null,
                        React.createElement(react_1.PrimaryButton, { text: obraEditandoId ? "Actualizar" : "Lanzar Proyecto", onClick: handleGuardar, disabled: !nuevaObra.Nombre || !nuevaObra.ClienteId }),
                        React.createElement(react_1.DefaultButton, { text: "Cancelar", onClick: function () { return setIsOpen(false); } })))))))));
};
exports.TablaObras = TablaObras;
//# sourceMappingURL=TablaObras.js.map