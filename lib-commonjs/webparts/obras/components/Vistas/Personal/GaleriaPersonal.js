"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaleriaPersonal = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var PersonalService_1 = require("../../../service/PersonalService");
var GaleriaPersonal_module_scss_1 = tslib_1.__importDefault(require("./GaleriaPersonal.module.scss"));
var PersonaShimmer = function () { return (React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.cardEmpleadoShimmer },
    React.createElement(react_1.Stack, { horizontalAlign: "center", tokens: { childrenGap: 15 } },
        React.createElement(react_1.Shimmer, { shimmerElements: [{ type: react_1.ShimmerElementType.circle, height: 100 }] }),
        React.createElement(react_1.Shimmer, { shimmerElements: [{ type: react_1.ShimmerElementType.line, height: 16, width: '80%' }] }),
        React.createElement(react_1.Shimmer, { shimmerElements: [{ type: react_1.ShimmerElementType.line, height: 12, width: '60%' }] }),
        React.createElement(react_1.Separator, { className: GaleriaPersonal_module_scss_1.default.shimmerSeparator }),
        React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", className: GaleriaPersonal_module_scss_1.default.fullWidth },
            React.createElement(react_1.Shimmer, { shimmerElements: [{ type: react_1.ShimmerElementType.line, height: 10, width: '30%' }] }),
            React.createElement(react_1.Shimmer, { shimmerElements: [{ type: react_1.ShimmerElementType.circle, height: 16 }] }))))); };
var GaleriaPersonal = function (props) {
    var _a = React.useState([]), empleados = _a[0], setEmpleados = _a[1];
    var _b = React.useState([]), rolOptions = _b[0], setRolOptions = _b[1];
    var _c = React.useState([]), fotoOptions = _c[0], setFotoOptions = _c[1];
    var _d = React.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = React.useState(false), isOpen = _e[0], setIsOpen = _e[1];
    var _f = React.useState(false), saving = _f[0], setSaving = _f[1];
    var _g = React.useState(null), editandoId = _g[0], setEditandoId = _g[1];
    var _h = React.useState(true), hideDeleteDialog = _h[0], setHideDeleteDialog = _h[1];
    var _j = React.useState({
        NombreyApellido: "",
        Rol: "",
        FotoPerfil: ""
    }), formulario = _j[0], setFormulario = _j[1];
    var service = React.useMemo(function () { return new PersonalService_1.PersonalService(props.context); }, [props.context]);
    var cargarDatos = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var _a, data, opciones, fotos, err_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            service.getPersonal(),
                            service.getRolOptions(),
                            service.getFotosDisponibles()
                        ])];
                case 1:
                    _a = _b.sent(), data = _a[0], opciones = _a[1], fotos = _a[2];
                    setEmpleados(data || []);
                    setRolOptions(opciones.map(function (opt) { return ({ key: opt, text: opt }); }));
                    setFotoOptions(fotos.map(function (f) { return ({ key: f.url, text: f.text }); }));
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _b.sent();
                    console.error("Error cargando datos:", err_1);
                    return [3 /*break*/, 4];
                case 3:
                    setTimeout(function () { return setLoading(false); }, 500);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () {
        cargarDatos().catch(console.error);
    }, []);
    var abrirEdicion = function (emp) {
        var _a;
        setEditandoId(emp.Id);
        setFormulario({
            NombreyApellido: emp.NombreyApellido,
            Rol: emp.Rol || ((_a = rolOptions[0]) === null || _a === void 0 ? void 0 : _a.key) || "",
            FotoPerfil: emp.FotoPerfil || ""
        });
        setIsOpen(true);
    };
    var abrirNuevo = function () {
        var _a;
        setEditandoId(null);
        setFormulario({ NombreyApellido: "", Rol: ((_a = rolOptions[0]) === null || _a === void 0 ? void 0 : _a.key) || "", FotoPerfil: "" });
        setIsOpen(true);
    };
    var handleGuardar = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formulario.NombreyApellido.trim())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    setSaving(true);
                    if (!editandoId) return [3 /*break*/, 3];
                    return [4 /*yield*/, service.actualizarTrabajador(editandoId, formulario)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, service.crearTrabajador(formulario)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    setIsOpen(false);
                    return [4 /*yield*/, cargarDatos()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    e_1 = _a.sent();
                    console.error("Error al guardar:", e_1);
                    alert("Error al guardar en SharePoint.");
                    return [3 /*break*/, 9];
                case 8:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var handleEliminar = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var e_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editandoId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setSaving(true);
                    return [4 /*yield*/, service.eliminarTrabajador(editandoId)];
                case 2:
                    _a.sent();
                    setHideDeleteDialog(true);
                    setIsOpen(false);
                    return [4 /*yield*/, cargarDatos()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_2 = _a.sent();
                    console.error("Error al eliminar:", e_2);
                    alert("Error al eliminar de SharePoint.");
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.container },
        React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center", className: GaleriaPersonal_module_scss_1.default.headerSection },
            React.createElement(react_1.Stack, null,
                React.createElement(react_1.Text, { variant: "xxLarge", className: GaleriaPersonal_module_scss_1.default.tituloPrincipal }, "Equipo EWS"),
                React.createElement(react_1.Text, { variant: "small", className: GaleriaPersonal_module_scss_1.default.subtitulo }, "Gesti\u00F3n de talento para un futuro sostenible")),
            React.createElement(react_1.PrimaryButton, { text: "Nuevo Personal", iconProps: { iconName: "AddFriend" }, onClick: abrirNuevo, className: GaleriaPersonal_module_scss_1.default.btnNuevo })),
        React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.gridPersonal }, loading ? (Array.from({ length: 6 }).map(function (_, i) { return React.createElement(PersonaShimmer, { key: i }); })) : empleados.length > 0 ? (empleados.map(function (emp) { return (React.createElement("div", { key: emp.Id, className: GaleriaPersonal_module_scss_1.default.cardEmpleado },
            React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.editOverlay },
                React.createElement(react_1.IconButton, { iconProps: { iconName: 'Edit' }, title: "Editar a ".concat(emp.NombreyApellido), onClick: function () { return abrirEdicion(emp); }, className: GaleriaPersonal_module_scss_1.default.editButton })),
            React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.avatarArea },
                React.createElement(react_1.Persona, { imageUrl: emp.FotoPerfil, text: emp.NombreyApellido, size: react_1.PersonaSize.size100, hidePersonaDetails: true })),
            React.createElement(react_1.Stack, { horizontalAlign: "center", tokens: { childrenGap: 4 } },
                React.createElement(react_1.Text, { className: GaleriaPersonal_module_scss_1.default.nombre }, emp.NombreyApellido),
                React.createElement(react_1.Stack, { horizontal: true, verticalAlign: "center", tokens: { childrenGap: 6 } },
                    React.createElement(react_1.Icon, { iconName: "WorkItem", className: GaleriaPersonal_module_scss_1.default.iconCargo }),
                    React.createElement(react_1.Text, { className: GaleriaPersonal_module_scss_1.default.cargo }, emp.Rol))),
            React.createElement(react_1.Separator, { className: GaleriaPersonal_module_scss_1.default.cardSeparator }),
            React.createElement(react_1.Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center" },
                React.createElement(react_1.Text, { className: GaleriaPersonal_module_scss_1.default.idEmpleado },
                    "ID: ",
                    emp.Id),
                React.createElement(react_1.Icon, { iconName: "Contact", className: GaleriaPersonal_module_scss_1.default.iconContact })))); })) : (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.info }, "No se encontraron empleados."))),
        React.createElement(react_1.Modal, { isOpen: isOpen, onDismiss: function () { return setIsOpen(false); }, isBlocking: false, className: GaleriaPersonal_module_scss_1.default.modalFlotante },
            React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.modalContent },
                React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.modalHeader },
                    React.createElement(react_1.Text, { variant: "xLarge", className: GaleriaPersonal_module_scss_1.default.modalTitle }, editandoId ? "Actualizar Perfil" : "Nuevo Miembro del Equipo"),
                    React.createElement(react_1.IconButton, { iconProps: { iconName: 'Cancel' }, ariaLabel: "Cerrar", onClick: function () { return setIsOpen(false); } })),
                React.createElement(react_1.Separator, { className: GaleriaPersonal_module_scss_1.default.modalSeparator }),
                React.createElement(react_1.Stack, { tokens: { childrenGap: 15 }, className: GaleriaPersonal_module_scss_1.default.modalBody },
                    React.createElement(react_1.TextField, { label: "Nombre y Apellido", required: true, value: formulario.NombreyApellido, onChange: function (_, v) { return setFormulario(tslib_1.__assign(tslib_1.__assign({}, formulario), { NombreyApellido: v || "" })); } }),
                    React.createElement(react_1.Dropdown, { label: "Rol / Cargo", options: rolOptions, selectedKey: formulario.Rol, onChange: function (_, opt) { return setFormulario(tslib_1.__assign(tslib_1.__assign({}, formulario), { Rol: opt === null || opt === void 0 ? void 0 : opt.key })); } }),
                    React.createElement(react_1.Dropdown, { label: "Fotograf\u00EDa", options: fotoOptions, selectedKey: formulario.FotoPerfil, onChange: function (_, opt) { return setFormulario(tslib_1.__assign(tslib_1.__assign({}, formulario), { FotoPerfil: opt === null || opt === void 0 ? void 0 : opt.key })); } }),
                    formulario.FotoPerfil && (React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.previewBox },
                        React.createElement(react_1.Stack, { horizontalAlign: "center", tokens: { childrenGap: 10 } },
                            React.createElement(react_1.Text, { variant: "small", className: GaleriaPersonal_module_scss_1.default.previewTitle }, "Vista previa del carnet:"),
                            React.createElement(react_1.Persona, { imageUrl: formulario.FotoPerfil, size: react_1.PersonaSize.size120, hidePersonaDetails: true }))))),
                React.createElement("div", { className: GaleriaPersonal_module_scss_1.default.modalFooter }, saving ? (React.createElement(react_1.Spinner, { label: "Procesando..." })) : (React.createElement(react_1.Stack, { horizontal: true, tokens: { childrenGap: 10 }, horizontalAlign: "end" },
                    React.createElement(react_1.PrimaryButton, { text: editandoId ? "Actualizar" : "Registrar", onClick: handleGuardar, disabled: !formulario.NombreyApellido.trim(), className: GaleriaPersonal_module_scss_1.default.btnPanelPrimary }),
                    editandoId && (React.createElement(react_1.DefaultButton, { text: "Eliminar", onClick: function () { return setHideDeleteDialog(false); }, className: GaleriaPersonal_module_scss_1.default.btnDelete })),
                    React.createElement(react_1.DefaultButton, { text: "Cancelar", onClick: function () { return setIsOpen(false); } })))))),
        React.createElement(react_1.Dialog, { hidden: hideDeleteDialog, onDismiss: function () { return setHideDeleteDialog(true); }, dialogContentProps: {
                type: react_1.DialogType.normal,
                title: 'Confirmar eliminación',
                subText: "\u00BFEst\u00E1s seguro de que quieres eliminar a ".concat(formulario.NombreyApellido, "? Esta acci\u00F3n no se puede deshacer.")
            }, modalProps: { isBlocking: true } },
            React.createElement(react_1.DialogFooter, null,
                React.createElement(react_1.PrimaryButton, { onClick: handleEliminar, text: "Eliminar", className: GaleriaPersonal_module_scss_1.default.btnConfirmDelete }),
                React.createElement(react_1.DefaultButton, { onClick: function () { return setHideDeleteDialog(true); }, text: "Cancelar" })))));
};
exports.GaleriaPersonal = GaleriaPersonal;
//# sourceMappingURL=GaleriaPersonal.js.map