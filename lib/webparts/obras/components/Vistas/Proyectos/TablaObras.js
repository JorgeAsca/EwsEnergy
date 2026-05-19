import { __assign, __awaiter, __generator } from "tslib";
import * as React from "react";
import { Stack, Text, PrimaryButton, TextField, DatePicker, Dropdown, Spinner, SpinnerSize, MessageBar, MessageBarType, Separator, Facepile, PersonaSize, Icon, Image, ImageFit, Modal, IconButton, DefaultButton, } from "@fluentui/react";
import { SPHttpClient } from "@microsoft/sp-http";
import { ProjectService } from "../../../service/ProjectService";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import styles from "./TablaObras.module.scss";
export var TablaObras = function (props) {
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
        project: new ProjectService(props.context),
        personal: new PersonalService(props.context),
        asig: new AsignacionesService(props.context)
    }); }, [props.context]);
    // --- LÓGICA DE CARGA CENTRALIZADA ---
    var cargarTodo = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, listaObras, respClientes, listaAsignaciones_1, listaPersonal_1, opcionesClientes_1, dataC, obrasProcesadas, actualizada, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            services.project.getObras(),
                            props.context.spHttpClient.get("".concat(props.context.pageContext.web.absoluteUrl, "/_api/web/lists/getbytitle('Clientes')/items?$select=Id,Title"), SPHttpClient.configurations.v1),
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
                        return __assign(__assign({}, o), { clienteNombre: ((_a = opcionesClientes_1.find(function (c) { var _a; return Number(c.key) === ((_a = o.Cliente) === null || _a === void 0 ? void 0 : _a.Id); })) === null || _a === void 0 ? void 0 : _a.text) || "Cliente no definido", porcentajeReal: Math.min(Math.max(porcentajeReal, 0), 1), operarios: operariosAsignados, jornadasConsumidas: parseFloat((porcentajeReal * (o.JornadasTotales || 30)).toFixed(1)) });
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
    var verDetallesObra = function (obra) { return __awaiter(void 0, void 0, void 0, function () {
        var fotos, e_2;
        return __generator(this, function (_a) {
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
    var handleGuardar = function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
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
    var handleAccionObra = function (id, accion) { return __awaiter(void 0, void 0, void 0, function () {
        var confirmacion, endpoint, e_4;
        return __generator(this, function (_a) {
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
                    return [4 /*yield*/, props.context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
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
        return (React.createElement("div", { className: styles.progressTrackerBox, title: "Avance: ".concat((pReal * 100).toFixed(0), "%") }, Array.from({ length: totalBoxes }).map(function (_, idx) { return (React.createElement("div", { key: idx, className: "".concat(styles.trackerDot, " ").concat(idx < filledBoxes ? styles.filledOnTrack : "") })); })));
    };
    var obrasAgrupadas = obras.reduce(function (acc, obra) {
        var estado = obra.EstadoObra || "Sin Asignar";
        if (!acc[estado])
            acc[estado] = [];
        acc[estado].push(obra);
        return acc;
    }, {});
    if (loading && obras.length === 0)
        return React.createElement(Spinner, { size: SpinnerSize.large, label: "Sincronizando Dashboard EWS..." });
    return (React.createElement("div", { className: styles.container },
        React.createElement("div", { className: styles.headerSection },
            React.createElement(Stack, null,
                React.createElement(Text, { variant: "xxLarge", className: styles.tituloPrincipal }, "Panel de Control de Obras"),
                React.createElement(Text, { variant: "small", className: styles.subtituloHeader }, "Gesti\u00F3n y seguimiento EWS Energy")),
            React.createElement(PrimaryButton, { iconProps: { iconName: "Add" }, text: "Nueva Obra", onClick: function () { resetForm(); setIsOpen(true); }, className: styles.btnNuevaObra })),
        React.createElement("div", { className: styles.splitLayout },
            React.createElement("div", { className: styles.listColumn },
                React.createElement("div", { className: styles.listContainer },
                    Object.keys(obrasAgrupadas).length === 0 && React.createElement(MessageBar, null, "No hay proyectos registrados."),
                    Object.keys(obrasAgrupadas).map(function (estado) { return (React.createElement("div", { key: estado },
                        React.createElement(Text, { className: styles.listGroupHeader }, estado),
                        obrasAgrupadas[estado].map(function (o) { return (React.createElement("div", { key: o.Id, className: "".concat(styles.listItem, " ").concat((obraSeleccionada === null || obraSeleccionada === void 0 ? void 0 : obraSeleccionada.Id) === o.Id ? styles.selected : ""), onClick: function () { return verDetallesObra(o); } },
                            React.createElement(Text, { className: styles.obraTitle }, o.Title),
                            renderProgressTracker(o.porcentajeReal))); }))); }))),
            React.createElement("div", { className: styles.detailColumn }, obraSeleccionada ? (React.createElement("div", { className: styles.detailContent },
                React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center" },
                    React.createElement(Stack, null,
                        React.createElement(Text, { variant: "xLarge", className: styles.detailTitle }, obraSeleccionada.Title),
                        React.createElement(Text, { variant: "small", style: { color: "#666" } }, obraSeleccionada.clienteNombre)),
                    React.createElement("div", { className: "".concat(styles.badgeEstado, " ").concat(obraSeleccionada.EstadoObra === "Finalizado" ? styles.finalizado : obraSeleccionada.EstadoObra === "Cancelado" ? styles.cancelado : styles.activo) }, obraSeleccionada.EstadoObra || "Fase Previa"),
                    React.createElement(DefaultButton, { iconProps: { iconName: "Edit" }, text: "Editar", onClick: function () {
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
                React.createElement(Separator, null),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 40 }, className: styles.infoSection },
                    React.createElement(Stack, null,
                        React.createElement(Text, { className: styles.labelSeccion }, "Direcci\u00F3n"),
                        React.createElement(Text, null,
                            React.createElement(Icon, { iconName: "MapPin", className: styles.iconVerde }),
                            " ",
                            obraSeleccionada.DireccionObra || "Sin dirección")),
                    React.createElement(Stack, null,
                        React.createElement(Text, { className: styles.labelSeccion }, "Jornadas Consumidas"),
                        React.createElement(Text, null,
                            React.createElement(Icon, { iconName: "Calendar", className: styles.iconVerde }),
                            " ",
                            obraSeleccionada.jornadasConsumidas,
                            " / ",
                            obraSeleccionada.JornadasTotales || 30)),
                    React.createElement(Stack, null,
                        React.createElement(Text, { className: styles.labelSeccion }, "Avance F\u00EDsico"),
                        React.createElement(Text, null,
                            React.createElement(Icon, { iconName: "CompletedSolid", className: styles.iconVerde }),
                            " ",
                            (obraSeleccionada.porcentajeReal * 100).toFixed(0),
                            "% Ejecutado")),
                    React.createElement(Stack, null,
                        React.createElement(Text, { className: styles.labelSeccion }, "Equipo en Campo"),
                        ((_a = obraSeleccionada.operarios) === null || _a === void 0 ? void 0 : _a.length) > 0 ? (React.createElement(Facepile, { personas: obraSeleccionada.operarios, personaSize: PersonaSize.size32 })) : React.createElement(Text, { variant: "small", style: { fontStyle: "italic", color: "#888" } }, "Sin personal asignado"))),
                React.createElement("div", { className: styles.planosSection },
                    React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center", styles: { root: { marginBottom: 15 } } },
                        React.createElement(Text, { variant: "large", className: styles.sectionTitle }, "Planos y Documentaci\u00F3n"),
                        React.createElement(DefaultButton, { iconProps: { iconName: "Upload" }, className: styles.btnUpload }, "A\u00F1adir Archivo")),
                    React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 15 }, wrap: true },
                        React.createElement("div", { className: styles.planoCard },
                            React.createElement(Icon, { iconName: "PDF", className: styles.pdfIcon }),
                            React.createElement(Text, { variant: "smallPlus" }, "Esquema_El\u00E9ctrico_v2.pdf")),
                        React.createElement("div", { className: styles.planoCard },
                            React.createElement(Icon, { iconName: "VisioDocument", className: styles.dwgIcon }),
                            React.createElement(Text, { variant: "smallPlus" }, "Topograf\u00EDa_Terreno.dwg")))),
                React.createElement("div", { className: styles.historialSection },
                    React.createElement(Text, { variant: "large", className: styles.sectionTitle }, "Reportes de Jornada"),
                    loadingFotos ? React.createElement(Spinner, { size: SpinnerSize.large, label: "Cargando reportes..." }) :
                        fotosObra.length > 0 ? (React.createElement(Stack, { tokens: { childrenGap: 15 }, styles: { root: { marginTop: 15 } } }, fotosObra.map(function (f, i) {
                            var _a;
                            return (React.createElement("div", { key: i, className: styles.fotoCard },
                                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 15 } },
                                    React.createElement(Image, { src: (_a = f.UrlFoto) === null || _a === void 0 ? void 0 : _a.Url, width: 120, height: 90, imageFit: ImageFit.cover, className: styles.fotoThumb }),
                                    React.createElement(Stack, null,
                                        React.createElement(Text, { className: styles.fotoFecha },
                                            "\uD83D\uDCC5 ",
                                            new Date(f.FechaRegistro).toLocaleDateString(),
                                            " - Worker ",
                                            f.Operario),
                                        React.createElement("div", { className: styles.fotoComentarioBox },
                                            React.createElement(Text, { className: styles.fotoComentarioText },
                                                "\"",
                                                f.Comentarios || "Sin observaciones técnicas",
                                                "\""))))));
                        }))) : React.createElement(MessageBar, { messageBarType: MessageBarType.info }, "No hay reportes para esta obra.")),
                React.createElement("div", { className: styles.planosSection },
                    React.createElement(Separator, null),
                    React.createElement(Stack, { tokens: { childrenGap: 15 }, style: { marginTop: '20px' } },
                        React.createElement(Text, { variant: "large", className: styles.sectionTitle }, "Gesti\u00F3n de Obra"),
                        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 12 }, verticalAlign: "center" }, isProcessing ? React.createElement(Spinner, { label: "Procesando..." }) : (React.createElement(React.Fragment, null,
                            React.createElement(PrimaryButton, { text: "Finalizar Obra", iconProps: { iconName: 'Completed' }, onClick: function () { return handleAccionObra(obraSeleccionada.Id, 'finalizar'); }, className: styles.btnNuevaObra }),
                            React.createElement(DefaultButton, { text: "Cancelar Obra", iconProps: { iconName: 'Clear' }, onClick: function () { return handleAccionObra(obraSeleccionada.Id, 'cancelar'); } }),
                            React.createElement(IconButton, { iconProps: { iconName: 'Delete' }, title: "Eliminar Obra", onClick: function () { return handleAccionObra(obraSeleccionada.Id, 'eliminar'); }, className: styles.btnClose })))))))) : (React.createElement("div", { className: styles.emptyState },
                React.createElement(Icon, { iconName: "ProjectCollection", className: styles.emptyIcon }),
                React.createElement(Text, { variant: "xLarge" }, "Selecciona una obra"),
                React.createElement(Text, { variant: "medium" }, "Pincha en un proyecto de la lista para ver su informaci\u00F3n detallada."))))),
        React.createElement(Modal, { isOpen: isOpen, onDismiss: function () { return setIsOpen(false); }, containerClassName: styles.modalFlotanteContainer },
            React.createElement("div", { className: styles.modalContent },
                React.createElement("div", { className: styles.modalHeader },
                    React.createElement(Text, { variant: "xLarge", className: styles.modalTitle }, obraEditandoId ? "Editar Proyecto" : "Configurar Nuevo Proyecto"),
                    React.createElement(IconButton, { iconProps: { iconName: "Cancel" }, onClick: function () { return setIsOpen(false); }, className: styles.btnClose })),
                React.createElement(Separator, { className: styles.modalSeparator }),
                React.createElement("div", { className: styles.modalBody },
                    React.createElement(Stack, { tokens: { childrenGap: 15 } },
                        React.createElement(TextField, { label: "Nombre del Proyecto", required: true, value: nuevaObra.Nombre, onChange: function (_, v) { return setNuevaObra(__assign(__assign({}, nuevaObra), { Nombre: v || "" })); } }),
                        React.createElement(Dropdown, { label: "Cliente", required: true, options: clientes, selectedKey: nuevaObra.ClienteId, onChange: function (_, opt) { return setNuevaObra(__assign(__assign({}, nuevaObra), { ClienteId: opt === null || opt === void 0 ? void 0 : opt.key })); } }),
                        React.createElement(TextField, { label: "Direcci\u00F3n de Obra", value: nuevaObra.Direccion, onChange: function (_, v) { return setNuevaObra(__assign(__assign({}, nuevaObra), { Direccion: v || "" })); } }),
                        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 20 } },
                            React.createElement(TextField, { label: "Jornadas Presupuestadas", type: "number", required: true, value: nuevaObra.JornadasTotales.toString(), onChange: function (_, v) { return setNuevaObra(__assign(__assign({}, nuevaObra), { JornadasTotales: parseInt(v || "0") })); }, styles: { root: { flex: 1 } } }),
                            React.createElement(DatePicker, { label: "Fecha Inicio", value: nuevaObra.FechaInicio, onSelectDate: function (d) { return setNuevaObra(__assign(__assign({}, nuevaObra), { FechaInicio: d || new Date() })); }, styles: { root: { flex: 1 } } })))),
                React.createElement("div", { className: styles.modalFooter },
                    React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 10 }, horizontalAlign: "end" }, saving ? React.createElement(Spinner, { label: "Guardando..." }) : (React.createElement(React.Fragment, null,
                        React.createElement(PrimaryButton, { text: obraEditandoId ? "Actualizar" : "Lanzar Proyecto", onClick: handleGuardar, disabled: !nuevaObra.Nombre || !nuevaObra.ClienteId }),
                        React.createElement(DefaultButton, { text: "Cancelar", onClick: function () { return setIsOpen(false); } })))))))));
};
//# sourceMappingURL=TablaObras.js.map