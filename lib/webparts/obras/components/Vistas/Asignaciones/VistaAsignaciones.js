import { __assign, __awaiter, __generator } from "tslib";
import * as React from "react";
import { Stack, Text, Persona, PersonaSize, Dropdown, PrimaryButton, IconButton, Spinner, SpinnerSize, MessageBar, MessageBarType, DatePicker, Separator, Icon, } from "@fluentui/react";
import { AsignacionesService } from "../../../service/AsignacionesService";
import styles from "./VistaAsignaciones.module.scss";
export var VistaAsignaciones = function (props) {
    var _a = React.useState({ obras: [], personal: [], asignaciones: [] }), data = _a[0], setData = _a[1];
    var _b = React.useState(true), loading = _b[0], setLoading = _b[1];
    var _c = React.useState(null), error = _c[0], setError = _c[1];
    var _d = React.useState({
        obraId: 0,
        personalId: 0,
        fechaFin: new Date(),
    }), seleccion = _d[0], setSeleccion = _d[1];
    var service = React.useMemo(function () { return new AsignacionesService(props.context); }, [props.context]);
    var cargarDatos = React.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, obrasData, personalData, asignacionesData, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            service.getObrasActivas(),
                            service.getPersonalDisponible(),
                            service.getAsignaciones(),
                        ])];
                case 2:
                    _a = _b.sent(), obrasData = _a[0], personalData = _a[1], asignacionesData = _a[2];
                    setData({ obras: obrasData, personal: personalData, asignaciones: asignacionesData });
                    setError(null);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    setError("Error al cargar los datos de asignación.");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [service]);
    React.useEffect(function () {
        cargarDatos();
    }, [cargarDatos]);
    var handleAsignar = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!seleccion.obraId || !seleccion.personalId || !seleccion.fechaFin) {
                        alert("Por favor complete todos los campos requeridos");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, service.crearAsignacion(seleccion.obraId, seleccion.personalId, seleccion.fechaFin)];
                case 2:
                    _a.sent();
                    setSeleccion(function (prev) { return (__assign(__assign({}, prev), { personalId: 0 })); });
                    return [4 /*yield*/, cargarDatos()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    alert("No se pudo registrar la asignación.");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleEliminar = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("¿Está seguro de remover este personal de la obra?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, service.eliminarAsignacion(id)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, cargarDatos()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    alert("Error al eliminar la asignación.");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var formatearFecha = function (dateString) {
        if (!dateString)
            return new Date().toLocaleDateString();
        var d = new Date(dateString);
        return isNaN(d.getTime()) ? new Date().toLocaleDateString() : d.toLocaleDateString();
    };
    if (loading)
        return React.createElement(Spinner, { size: SpinnerSize.large, label: "Sincronizando cuadrillas..." });
    return (React.createElement("div", { className: styles.container },
        React.createElement(Text, { variant: "xLarge", className: styles.title }, "Gesti\u00F3n de Personal y Asignaciones"),
        React.createElement(Text, { className: styles.subtitle }, "Distribuye los operarios disponibles en los frentes de obra activos"),
        error && React.createElement(MessageBar, { messageBarType: MessageBarType.error }, error),
        React.createElement("div", { className: styles.panelAsignacion },
            React.createElement(Stack, { tokens: { childrenGap: 15 } },
                React.createElement(Text, { variant: "large", className: styles.panelTitle }, "Nueva Programaci\u00F3n de Obra"),
                React.createElement(Dropdown, { label: "Seleccionar Frente de Obra", placeholder: "Elija un proyecto activo", selectedKey: seleccion.obraId || undefined, options: data.obras.map(function (o) { return ({ key: o.Id, text: o.Title }); }), onChange: function (_, opt) { return setSeleccion(function (prev) { return (__assign(__assign({}, prev), { obraId: opt === null || opt === void 0 ? void 0 : opt.key })); }); } }),
                React.createElement(Dropdown, { label: "Seleccionar Operario", placeholder: "Elija un operario para el sitio", selectedKey: seleccion.personalId || undefined, options: data.personal.map(function (p) { return ({ key: p.Id, text: "".concat(p.NombreyApellido, " \u2014 (").concat(p.Rol, ")") }); }), onChange: function (_, opt) { return setSeleccion(function (prev) { return (__assign(__assign({}, prev), { personalId: opt === null || opt === void 0 ? void 0 : opt.key })); }); } }),
                React.createElement(DatePicker, { label: "Fecha de Trabajo / Ejecuci\u00F3n", placeholder: "\u00BFQu\u00E9 d\u00EDa asiste a la obra?", value: seleccion.fechaFin, onSelectDate: function (date) { return setSeleccion(function (prev) { return (__assign(__assign({}, prev), { fechaFin: date || new Date() })); }); } }),
                React.createElement(PrimaryButton, { text: "Asignar y Programar", onClick: handleAsignar, disabled: !seleccion.obraId || !seleccion.personalId }))),
        React.createElement(Separator, { className: styles.separator }),
        React.createElement("div", { className: styles.gridObras }, data.obras.map(function (o) {
            var asignados = data.asignaciones.filter(function (a) { return a.ObraId === o.Id; });
            return (React.createElement("div", { key: o.Id, className: styles.obraCard },
                React.createElement(Stack, { tokens: { childrenGap: 10 } },
                    React.createElement("div", { className: styles.obraHeader },
                        React.createElement(Text, { className: styles.obraTitle }, o.Title),
                        React.createElement(Text, { className: styles.obraUbicacion }, o.DireccionObra)),
                    React.createElement(Text, { variant: "medium", style: { fontWeight: 600, marginTop: 5 } }, "Cuadrilla Programada:"),
                    React.createElement(Stack, { tokens: { childrenGap: 10 }, className: styles.personalList }, asignados.length > 0 ? (asignados.map(function (asig) {
                        var p = data.personal.find(function (per) { return per.Id === asig.PersonalId; });
                        var semaforo = service.calcularSemaforoAsignacion(asig.FechaFin);
                        return (React.createElement("div", { key: asig.Id, className: styles.personalRow },
                            React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center", style: { width: "100%" } },
                                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 12 }, verticalAlign: "center", style: { flexGrow: 1 } },
                                    React.createElement(Persona, { imageUrl: p === null || p === void 0 ? void 0 : p.FotoPerfil, size: PersonaSize.size40, presence: semaforo.presence }),
                                    React.createElement(Stack, { tokens: { childrenGap: 2 } },
                                        React.createElement(Text, { className: styles.personaName }, p === null || p === void 0 ? void 0 : p.NombreyApellido),
                                        React.createElement(Text, { className: styles.semaforoText, style: { color: semaforo.presence === 4 ? "#d83b01" : "#107c41" } }, semaforo.label),
                                        React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 15 }, style: { marginTop: 4, opacity: 0.85 } },
                                            React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 4 }, verticalAlign: "center" },
                                                React.createElement(Icon, { iconName: "CalendarSettings", style: { fontSize: 12, color: "#0078d4" } }),
                                                React.createElement(Text, { variant: "small", style: { color: "#323130" } },
                                                    React.createElement("b", null, "Prog:"),
                                                    " ",
                                                    formatearFecha(asig.Created))),
                                            React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 4 }, verticalAlign: "center" },
                                                React.createElement(Icon, { iconName: "Balloons", style: { fontSize: 12, color: "#107c41" } }),
                                                React.createElement(Text, { variant: "small", style: { color: "#323130" } },
                                                    React.createElement("b", null, "Trabajo:"),
                                                    " ",
                                                    formatearFecha(asig.FechaFin)))))),
                                React.createElement(IconButton, { iconProps: { iconName: "Cancel" }, className: styles.deleteBtn, onClick: function () { return handleEliminar(asig.Id); } }))));
                    })) : (React.createElement(Text, { className: styles.emptyText }, "Sin personal asignado actualmente"))))));
        }))));
};
//# sourceMappingURL=VistaAsignaciones.js.map