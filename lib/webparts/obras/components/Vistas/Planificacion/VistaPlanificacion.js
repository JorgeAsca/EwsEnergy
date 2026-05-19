import { __assign, __awaiter, __generator, __spreadArray } from "tslib";
import * as React from "react";
import { Stack, Text, Persona, PersonaSize, Spinner, SpinnerSize, Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, TextField, IconButton, ProgressIndicator, } from "@fluentui/react";
import { ProjectService } from "../../../service/ProjectService";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import styles from "./VistaPlanificacion.module.scss";
var DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
export var VistaPlanificacion = function (_a) {
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
        project: new ProjectService(context),
        personal: new PersonalService(context),
        asig: new AsignacionesService(context),
    }); }, [context]);
    var getFechaPorDia = function (nombreDia) {
        var hoy = new Date();
        var lunes = new Date(hoy.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1));
        var index = DIAS_SEMANA.indexOf(nombreDia);
        var fechaResultado = new Date(lunes);
        fechaResultado.setDate(lunes.getDate() + index);
        return fechaResultado;
    };
    var cargarDatos = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, o, p, a, error_1;
        return __generator(this, function (_b) {
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
    var onDrop = function (ev, obraId, dia) { return __awaiter(void 0, void 0, void 0, function () {
        var personId, fecha;
        return __generator(this, function (_a) {
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
    var eliminarAsignacion = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
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
        return (React.createElement(Spinner, { label: "Cargando planificaci\u00F3n...", size: SpinnerSize.large }));
    return (React.createElement(Stack, { tokens: { childrenGap: 15 }, className: styles.vistaPlanificacion },
        React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center" },
            React.createElement(Text, { variant: "xLarge", className: styles.titulo }, "Planificaci\u00F3n Semanal"),
            React.createElement(PrimaryButton, { iconProps: { iconName: "Add" }, text: "Nota Pendiente", onClick: function () { return setShowAddPending(true); } })),
        React.createElement("div", { className: styles.personalPanelTop },
            React.createElement("div", { className: styles.personalListHorizontal }, personalDisponible.map(function (p) { return (React.createElement("div", { key: p.Id, draggable: true, onDragStart: function (e) {
                    return e.dataTransfer.setData("personId", p.Id.toString());
                }, className: styles.draggablePersonaCard },
                React.createElement(Persona, { text: p.NombreyApellido, imageUrl: p.FotoPerfil, size: PersonaSize.size24 }))); }))),
        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 15 }, styles: { root: { width: "100%", alignItems: "start" } } },
            React.createElement("div", { className: styles.tableContainer },
                React.createElement("table", { className: styles.planTable },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { className: styles.colObra }, "Obra"),
                            DIAS_SEMANA.map(function (d) { return (React.createElement("th", { key: d, className: styles.colDia }, d)); }))),
                    React.createElement("tbody", null, obras.map(function (obra) { return (React.createElement("tr", { key: obra.Id },
                        React.createElement("td", { className: styles.cellObra },
                            React.createElement(Stack, { tokens: { childrenGap: 4 } },
                                React.createElement(Text, { variant: "mediumPlus", styles: { root: { fontWeight: 600 } } }, obra.Title),
                                React.createElement(Stack, null,
                                    React.createElement(Text, { variant: "small", styles: { root: { color: '#666', fontSize: '11px' } } },
                                        "Avance: ",
                                        obra.ProgresoReal || 0,
                                        "% \u2022 ",
                                        obra.EstadoObra),
                                    React.createElement(ProgressIndicator, { percentComplete: (obra.ProgresoReal || 0) / 100, styles: {
                                            itemProgress: { padding: 0 },
                                            progressBar: { backgroundColor: '#107c41' }
                                        } })))),
                        DIAS_SEMANA.map(function (dia) {
                            var fechaDia = getFechaPorDia(dia).toDateString();
                            var asigsEnDia = asignaciones.filter(function (a) { return a.ObraId === obra.Id && new Date(a.FechaInicio).toDateString() === fechaDia; });
                            return (React.createElement("td", { key: dia, onDragOver: function (e) { return e.preventDefault(); }, onDrop: function (e) { return onDrop(e, obra.Id, dia); }, className: styles.dropZone },
                                React.createElement("div", { className: styles.asignadosConsola }, asigsEnDia.map(function (a) {
                                    var p = personalDisponible.find(function (pers) { return pers.Id === a.PersonalId; });
                                    return p ? (React.createElement("div", { key: a.Id, onClick: function () { return setSelectedAsig({ asig: a, persona: p }); }, className: styles.fotoAsignada },
                                        React.createElement(Persona, { text: p.NombreyApellido, imageUrl: p.FotoPerfil, size: PersonaSize.size32 }))) : null;
                                }))));
                        }))); })))),
            React.createElement("div", { className: styles.pendingPanel },
                React.createElement(Text, { className: styles.panelTituloCompacto }, "Pendientes"),
                React.createElement("div", { className: styles.pendingList },
                    obrasPendientes.length === 0 && (React.createElement("span", { className: styles.emptyText }, "Sin notas")),
                    obrasPendientes.map(function (op, idx) { return (React.createElement("div", { key: idx, className: styles.pendingItem },
                        React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between" },
                            React.createElement(Text, { className: styles.pendingName }, op.nombre),
                            React.createElement(IconButton, { iconProps: { iconName: "Cancel" }, styles: { root: { height: 16, width: 16, fontSize: 10 } }, onClick: function () {
                                    return setObrasPendientes(obrasPendientes.filter(function (_, i) { return i !== idx; }));
                                } })),
                        React.createElement(Text, { className: styles.pendingReason }, op.motivo))); })))),
        React.createElement(Dialog, { hidden: !showAddPending, onDismiss: function () { return setShowAddPending(false); }, dialogContentProps: {
                type: DialogType.normal,
                title: "Nueva Nota Pendiente",
            } },
            React.createElement(TextField, { label: "Nombre", value: newPending.nombre, onChange: function (_, v) { return setNewPending(__assign(__assign({}, newPending), { nombre: v || "" })); } }),
            React.createElement(TextField, { label: "Motivo", multiline: true, rows: 3, value: newPending.motivo, onChange: function (_, v) { return setNewPending(__assign(__assign({}, newPending), { motivo: v || "" })); } }),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: function () {
                        setObrasPendientes(__spreadArray(__spreadArray([], obrasPendientes, true), [newPending], false));
                        setNewPending({ nombre: "", motivo: "" });
                        setShowAddPending(false);
                    }, text: "A\u00F1adir" }),
                React.createElement(DefaultButton, { onClick: function () { return setShowAddPending(false); }, text: "Cancelar" }))),
        React.createElement(Dialog, { hidden: !selectedAsig, onDismiss: function () { return setSelectedAsig(null); }, dialogContentProps: {
                type: DialogType.normal,
                title: "Gestionar Asignación",
            } },
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: eliminarAsignacion, text: "Eliminar" }),
                React.createElement(DefaultButton, { onClick: function () { return setSelectedAsig(null); }, text: "Cancelar" })))));
};
//# sourceMappingURL=VistaPlanificacion.js.map