"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VistaPlanificacion = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var ProjectService_1 = require("../../../service/ProjectService");
var PersonalService_1 = require("../../../service/PersonalService");
var AsignacionesService_1 = require("../../../service/AsignacionesService");
var VistaPlanificacion_module_scss_1 = tslib_1.__importDefault(require("./VistaPlanificacion.module.scss"));
var DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
var VistaPlanificacion = function (_a) {
    var context = _a.context;
    var _b = React.useState([]), obras = _b[0], setObras = _b[1];
    var _c = React.useState([]), personalDisponible = _c[0], setPersonalDisponible = _c[1];
    var _d = React.useState([]), asignaciones = _d[0], setAsignaciones = _d[1];
    var _e = React.useState(true), loading = _e[0], setLoading = _e[1];
    var _f = React.useState(null), selectedAsig = _f[0], setSelectedAsig = _f[1];
    var _g = React.useState([]), obrasPendientes = _g[0], setObrasPendientes = _g[1];
    var _h = React.useState(false), showAddPending = _h[0], setShowAddPending = _h[1];
    var _j = React.useState({
        nombre: "",
        motivo: "",
    }), newPending = _j[0], setNewPending = _j[1];
    var services = React.useMemo(function () { return ({
        project: new ProjectService_1.ProjectService(context),
        personal: new PersonalService_1.PersonalService(context),
        asig: new AsignacionesService_1.AsignacionesService(context),
    }); }, [context]);
    var getFechaPorDia = function (nombreDia) {
        var hoy = new Date();
        var lunes = new Date(hoy.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1));
        var index = DIAS_SEMANA.indexOf(nombreDia);
        var fechaResultado = new Date(lunes);
        fechaResultado.setDate(lunes.getDate() + index);
        return fechaResultado;
    };
    var cargarDatos = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var _a, o, p, a, error_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            services.project.getObras(),
                            services.personal.getPersonal(),
                            services.asig.getAsignaciones(),
                        ])];
                case 2:
                    _a = _b.sent(), o = _a[0], p = _a[1], a = _a[2];
                    setObras(o);
                    setPersonalDisponible(p);
                    setAsignaciones(a);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error(error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () {
        cargarDatos();
    }, []);
    var onDrop = function (ev, obraId, dia) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var personId, fecha;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ev.preventDefault();
                    personId = parseInt(ev.dataTransfer.getData("personId"));
                    fecha = getFechaPorDia(dia);
                    return [4 /*yield*/, services.asig.asignarPersonal({
                            ObraId: obraId,
                            PersonalId: personId,
                            FechaInicio: fecha,
                            FechaFinPrevista: fecha,
                            EstadoProgreso: 0,
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, cargarDatos()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var eliminarAsignacion = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(selectedAsig === null || selectedAsig === void 0 ? void 0 : selectedAsig.asig.Id))
                        return [2 /*return*/];
                    return [4 /*yield*/, services.asig.eliminarAsignacion(selectedAsig.asig.Id)];
                case 1:
                    _a.sent();
                    setSelectedAsig(null);
                    return [4 /*yield*/, cargarDatos()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    if (loading)
        return (React.createElement(react_1.Spinner, { label: "Cargando planificaci\u00F3n...", size: react_1.SpinnerSize.large }));
    return (React.createElement(react_1.Stack, { tokens: { childrenGap: 15 }, className: VistaPlanificacion_module_scss_1.default.vistaPlanificacion },
        React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center" },
            React.createElement(react_1.Text, { variant: "xLarge", className: VistaPlanificacion_module_scss_1.default.titulo }, "Planificaci\u00F3n Semanal"),
            React.createElement(react_1.PrimaryButton, { iconProps: { iconName: "Add" }, text: "Nota Pendiente", onClick: function () { return setShowAddPending(true); } })),
        React.createElement("div", { className: VistaPlanificacion_module_scss_1.default.personalPanelTop },
            React.createElement("div", { className: VistaPlanificacion_module_scss_1.default.personalListHorizontal }, personalDisponible.map(function (p) { return (React.createElement("div", { key: p.Id, draggable: true, onDragStart: function (e) {
                    return e.dataTransfer.setData("personId", p.Id.toString());
                }, className: VistaPlanificacion_module_scss_1.default.draggablePersonaCard },
                React.createElement(react_1.Persona, { text: p.NombreyApellido, imageUrl: p.FotoPerfil, size: react_1.PersonaSize.size24 }))); }))),
        React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 15 }, styles: { root: { width: "100%", alignItems: "start" } } },
            React.createElement("div", { className: VistaPlanificacion_module_scss_1.default.tableContainer },
                React.createElement("table", { className: VistaPlanificacion_module_scss_1.default.planTable },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { className: VistaPlanificacion_module_scss_1.default.colObra }, "Obra"),
                            DIAS_SEMANA.map(function (d) { return (React.createElement("th", { key: d, className: VistaPlanificacion_module_scss_1.default.colDia }, d)); }))),
                    React.createElement("tbody", null, obras.map(function (obra) { return (React.createElement("tr", { key: obra.Id },
                        React.createElement("td", { className: VistaPlanificacion_module_scss_1.default.cellObra },
                            React.createElement(react_1.Stack, { tokens: { childrenGap: 4 } },
                                React.createElement(react_1.Text, { variant: "mediumPlus", styles: { root: { fontWeight: 600 } } }, obra.Title),
                                React.createElement(react_1.Stack, null,
                                    React.createElement(react_1.Text, { variant: "small", styles: { root: { color: '#666', fontSize: '11px' } } },
                                        "Avance: ",
                                        obra.ProgresoReal || 0,
                                        "% \u2022 ",
                                        obra.EstadoObra),
                                    React.createElement(react_1.ProgressIndicator, { percentComplete: (obra.ProgresoReal || 0) / 100, styles: {
                                            itemProgress: { padding: 0 },
                                            progressBar: { backgroundColor: '#107c41' }
                                        } })))),
                        DIAS_SEMANA.map(function (dia) {
                            var fechaDia = getFechaPorDia(dia).toDateString();
                            var asigsEnDia = asignaciones.filter(function (a) { return a.ObraId === obra.Id && new Date(a.FechaInicio).toDateString() === fechaDia; });
                            return (React.createElement("td", { key: dia, onDragOver: function (e) { return e.preventDefault(); }, onDrop: function (e) { return onDrop(e, obra.Id, dia); }, className: VistaPlanificacion_module_scss_1.default.dropZone },
                                React.createElement("div", { className: VistaPlanificacion_module_scss_1.default.asignadosConsola }, asigsEnDia.map(function (a) {
                                    var p = personalDisponible.find(function (pers) { return pers.Id === a.PersonalId; });
                                    return p ? (React.createElement("div", { key: a.Id, onClick: function () { return setSelectedAsig({ asig: a, persona: p }); }, className: VistaPlanificacion_module_scss_1.default.fotoAsignada },
                                        React.createElement(react_1.Persona, { text: p.NombreyApellido, imageUrl: p.FotoPerfil, size: react_1.PersonaSize.size32 }))) : null;
                                }))));
                        }))); })))),
            React.createElement("div", { className: VistaPlanificacion_module_scss_1.default.pendingPanel },
                React.createElement(react_1.Text, { className: VistaPlanificacion_module_scss_1.default.panelTituloCompacto }, "Pendientes"),
                React.createElement("div", { className: VistaPlanificacion_module_scss_1.default.pendingList },
                    obrasPendientes.length === 0 && (React.createElement("span", { className: VistaPlanificacion_module_scss_1.default.emptyText }, "Sin notas")),
                    obrasPendientes.map(function (op, idx) { return (React.createElement("div", { key: idx, className: VistaPlanificacion_module_scss_1.default.pendingItem },
                        React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between" },
                            React.createElement(react_1.Text, { className: VistaPlanificacion_module_scss_1.default.pendingName }, op.nombre),
                            React.createElement(react_1.IconButton, { iconProps: { iconName: "Cancel" }, styles: { root: { height: 16, width: 16, fontSize: 10 } }, onClick: function () {
                                    return setObrasPendientes(obrasPendientes.filter(function (_, i) { return i !== idx; }));
                                } })),
                        React.createElement(react_1.Text, { className: VistaPlanificacion_module_scss_1.default.pendingReason }, op.motivo))); })))),
        React.createElement(react_1.Dialog, { hidden: !showAddPending, onDismiss: function () { return setShowAddPending(false); }, dialogContentProps: {
                type: react_1.DialogType.normal,
                title: "Nueva Nota Pendiente",
            } },
            React.createElement(react_1.TextField, { label: "Nombre", value: newPending.nombre, onChange: function (_, v) { return setNewPending(tslib_1.__assign(tslib_1.__assign({}, newPending), { nombre: v || "" })); } }),
            React.createElement(react_1.TextField, { label: "Motivo", multiline: true, rows: 3, value: newPending.motivo, onChange: function (_, v) { return setNewPending(tslib_1.__assign(tslib_1.__assign({}, newPending), { motivo: v || "" })); } }),
            React.createElement(react_1.DialogFooter, null,
                React.createElement(react_1.PrimaryButton, { onClick: function () {
                        setObrasPendientes(tslib_1.__spreadArray(tslib_1.__spreadArray([], obrasPendientes, true), [newPending], false));
                        setNewPending({ nombre: "", motivo: "" });
                        setShowAddPending(false);
                    }, text: "A\u00F1adir" }),
                React.createElement(react_1.DefaultButton, { onClick: function () { return setShowAddPending(false); }, text: "Cancelar" }))),
        React.createElement(react_1.Dialog, { hidden: !selectedAsig, onDismiss: function () { return setSelectedAsig(null); }, dialogContentProps: {
                type: react_1.DialogType.normal,
                title: "Gestionar Asignación",
            } },
            React.createElement(react_1.DialogFooter, null,
                React.createElement(react_1.PrimaryButton, { onClick: eliminarAsignacion, text: "Eliminar" }),
                React.createElement(react_1.DefaultButton, { onClick: function () { return setSelectedAsig(null); }, text: "Cancelar" })))));
};
exports.VistaPlanificacion = VistaPlanificacion;
//# sourceMappingURL=VistaPlanificacion.js.map