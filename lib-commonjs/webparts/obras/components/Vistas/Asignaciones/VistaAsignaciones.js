"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VistaAsignaciones = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var AsignacionesService_1 = require("../../../service/AsignacionesService");
var VistaAsignaciones_module_scss_1 = tslib_1.__importDefault(require("./VistaAsignaciones.module.scss"));
var VistaAsignaciones = function (props) {
    var _a = React.useState({ obras: [], personal: [], asignaciones: [] }), data = _a[0], setData = _a[1];
    var _b = React.useState(true), loading = _b[0], setLoading = _b[1];
    var _c = React.useState(null), error = _c[0], setError = _c[1];
    var _d = React.useState({
        obraId: 0,
        personalId: 0,
        fechaFin: new Date(),
    }), seleccion = _d[0], setSeleccion = _d[1];
    var service = React.useMemo(function () { return new AsignacionesService_1.AsignacionesService(props.context); }, [props.context]);
    var cargarDatos = React.useCallback(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var _a, obrasData, personalData, asignacionesData, err_1;
        return tslib_1.__generator(this, function (_b) {
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
    var handleAsignar = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return tslib_1.__generator(this, function (_a) {
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
                    setSeleccion(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { personalId: 0 })); });
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
    var handleEliminar = function (id) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var err_3;
        return tslib_1.__generator(this, function (_a) {
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
        return React.createElement(react_1.Spinner, { size: react_1.SpinnerSize.large, label: "Sincronizando cuadrillas..." });
    return (React.createElement("div", { className: VistaAsignaciones_module_scss_1.default.container },
        React.createElement(react_1.Text, { variant: "xLarge", className: VistaAsignaciones_module_scss_1.default.title }, "Gesti\u00F3n de Personal y Asignaciones"),
        React.createElement(react_1.Text, { className: VistaAsignaciones_module_scss_1.default.subtitle }, "Distribuye los operarios disponibles en los frentes de obra activos"),
        error && React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error }, error),
        React.createElement("div", { className: VistaAsignaciones_module_scss_1.default.panelAsignacion },
            React.createElement(react_1.Stack, { tokens: { childrenGap: 15 } },
                React.createElement(react_1.Text, { variant: "large", className: VistaAsignaciones_module_scss_1.default.panelTitle }, "Nueva Programaci\u00F3n de Obra"),
                React.createElement(react_1.Dropdown, { label: "Seleccionar Frente de Obra", placeholder: "Elija un proyecto activo", selectedKey: seleccion.obraId || undefined, options: data.obras.map(function (o) { return ({ key: o.Id, text: o.Title }); }), onChange: function (_, opt) { return setSeleccion(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { obraId: opt === null || opt === void 0 ? void 0 : opt.key })); }); } }),
                React.createElement(react_1.Dropdown, { label: "Seleccionar Operario", placeholder: "Elija un operario para el sitio", selectedKey: seleccion.personalId || undefined, options: data.personal.map(function (p) { return ({ key: p.Id, text: "".concat(p.NombreyApellido, " \u2014 (").concat(p.Rol, ")") }); }), onChange: function (_, opt) { return setSeleccion(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { personalId: opt === null || opt === void 0 ? void 0 : opt.key })); }); } }),
                React.createElement(react_1.DatePicker, { label: "Fecha de Trabajo / Ejecuci\u00F3n", placeholder: "\u00BFQu\u00E9 d\u00EDa asiste a la obra?", value: seleccion.fechaFin, onSelectDate: function (date) { return setSeleccion(function (prev) { return (tslib_1.__assign(tslib_1.__assign({}, prev), { fechaFin: date || new Date() })); }); } }),
                React.createElement(react_1.PrimaryButton, { text: "Asignar y Programar", onClick: handleAsignar, disabled: !seleccion.obraId || !seleccion.personalId }))),
        React.createElement(react_1.Separator, { className: VistaAsignaciones_module_scss_1.default.separator }),
        React.createElement("div", { className: VistaAsignaciones_module_scss_1.default.gridObras }, data.obras.map(function (o) {
            var asignados = data.asignaciones.filter(function (a) { return a.ObraId === o.Id; });
            return (React.createElement("div", { key: o.Id, className: VistaAsignaciones_module_scss_1.default.obraCard },
                React.createElement(react_1.Stack, { tokens: { childrenGap: 10 } },
                    React.createElement("div", { className: VistaAsignaciones_module_scss_1.default.obraHeader },
                        React.createElement(react_1.Text, { className: VistaAsignaciones_module_scss_1.default.obraTitle }, o.Title),
                        React.createElement(react_1.Text, { className: VistaAsignaciones_module_scss_1.default.obraUbicacion }, o.DireccionObra)),
                    React.createElement(react_1.Text, { variant: "medium", style: { fontWeight: 600, marginTop: 5 } }, "Cuadrilla Programada:"),
                    React.createElement(react_1.Stack, { tokens: { childrenGap: 10 }, className: VistaAsignaciones_module_scss_1.default.personalList }, asignados.length > 0 ? (asignados.map(function (asig) {
                        var p = data.personal.find(function (per) { return per.Id === asig.PersonalId; });
                        var semaforo = service.calcularSemaforoAsignacion(asig.FechaFin);
                        return (React.createElement("div", { key: asig.Id, className: VistaAsignaciones_module_scss_1.default.personalRow },
                            React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center", style: { width: "100%" } },
                                React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 12 }, verticalAlign: "center", style: { flexGrow: 1 } },
                                    React.createElement(react_1.Persona, { imageUrl: p === null || p === void 0 ? void 0 : p.FotoPerfil, size: react_1.PersonaSize.size40, presence: semaforo.presence }),
                                    React.createElement(react_1.Stack, { tokens: { childrenGap: 2 } },
                                        React.createElement(react_1.Text, { className: VistaAsignaciones_module_scss_1.default.personaName }, p === null || p === void 0 ? void 0 : p.NombreyApellido),
                                        React.createElement(react_1.Text, { className: VistaAsignaciones_module_scss_1.default.semaforoText, style: { color: semaforo.presence === 4 ? "#d83b01" : "#107c41" } }, semaforo.label),
                                        React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 15 }, style: { marginTop: 4, opacity: 0.85 } },
                                            React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 4 }, verticalAlign: "center" },
                                                React.createElement(react_1.Icon, { iconName: "CalendarSettings", style: { fontSize: 12, color: "#0078d4" } }),
                                                React.createElement(react_1.Text, { variant: "small", style: { color: "#323130" } },
                                                    React.createElement("b", null, "Prog:"),
                                                    " ",
                                                    formatearFecha(asig.Created))),
                                            React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 4 }, verticalAlign: "center" },
                                                React.createElement(react_1.Icon, { iconName: "Balloons", style: { fontSize: 12, color: "#107c41" } }),
                                                React.createElement(react_1.Text, { variant: "small", style: { color: "#323130" } },
                                                    React.createElement("b", null, "Trabajo:"),
                                                    " ",
                                                    formatearFecha(asig.FechaFin)))))),
                                React.createElement(react_1.IconButton, { iconProps: { iconName: "Cancel" }, className: VistaAsignaciones_module_scss_1.default.deleteBtn, onClick: function () { return handleEliminar(asig.Id); } }))));
                    })) : (React.createElement(react_1.Text, { className: VistaAsignaciones_module_scss_1.default.emptyText }, "Sin personal asignado actualmente"))))));
        }))));
};
exports.VistaAsignaciones = VistaAsignaciones;
//# sourceMappingURL=VistaAsignaciones.js.map