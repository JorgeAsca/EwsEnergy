import { __assign, __awaiter, __generator } from "tslib";
import * as React from "react";
import { Stack, Text, Persona, PersonaSize, Spinner, MessageBar, MessageBarType, PrimaryButton, DefaultButton, TextField, Dropdown, Icon, Separator, IconButton, Shimmer, ShimmerElementType, Dialog, DialogType, DialogFooter, Modal } from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import styles from "./GaleriaPersonal.module.scss";
var PersonaShimmer = function () { return (React.createElement("div", { className: styles.cardEmpleadoShimmer },
    React.createElement(Stack, { horizontalAlign: "center", tokens: { childrenGap: 15 } },
        React.createElement(Shimmer, { shimmerElements: [{ type: ShimmerElementType.circle, height: 100 }] }),
        React.createElement(Shimmer, { shimmerElements: [{ type: ShimmerElementType.line, height: 16, width: '80%' }] }),
        React.createElement(Shimmer, { shimmerElements: [{ type: ShimmerElementType.line, height: 12, width: '60%' }] }),
        React.createElement(Separator, { className: styles.shimmerSeparator }),
        React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", className: styles.fullWidth },
            React.createElement(Shimmer, { shimmerElements: [{ type: ShimmerElementType.line, height: 10, width: '30%' }] }),
            React.createElement(Shimmer, { shimmerElements: [{ type: ShimmerElementType.circle, height: 16 }] }))))); };
export var GaleriaPersonal = function (props) {
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
    var service = React.useMemo(function () { return new PersonalService(props.context); }, [props.context]);
    var cargarDatos = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, opciones, fotos, err_1;
        return __generator(this, function (_b) {
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
    var handleGuardar = function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
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
    var handleEliminar = function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
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
    return (React.createElement("div", { className: styles.container },
        React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center", className: styles.headerSection },
            React.createElement(Stack, null,
                React.createElement(Text, { variant: "xxLarge", className: styles.tituloPrincipal }, "Equipo EWS"),
                React.createElement(Text, { variant: "small", className: styles.subtitulo }, "Gesti\u00F3n de talento para un futuro sostenible")),
            React.createElement(PrimaryButton, { text: "Nuevo Personal", iconProps: { iconName: "AddFriend" }, onClick: abrirNuevo, className: styles.btnNuevo })),
        React.createElement("div", { className: styles.gridPersonal }, loading ? (Array.from({ length: 6 }).map(function (_, i) { return React.createElement(PersonaShimmer, { key: i }); })) : empleados.length > 0 ? (empleados.map(function (emp) { return (React.createElement("div", { key: emp.Id, className: styles.cardEmpleado },
            React.createElement("div", { className: styles.editOverlay },
                React.createElement(IconButton, { iconProps: { iconName: 'Edit' }, title: "Editar a ".concat(emp.NombreyApellido), onClick: function () { return abrirEdicion(emp); }, className: styles.editButton })),
            React.createElement("div", { className: styles.avatarArea },
                React.createElement(Persona, { imageUrl: emp.FotoPerfil, text: emp.NombreyApellido, size: PersonaSize.size100, hidePersonaDetails: true })),
            React.createElement(Stack, { horizontalAlign: "center", tokens: { childrenGap: 4 } },
                React.createElement(Text, { className: styles.nombre }, emp.NombreyApellido),
                React.createElement(Stack, { horizontal: true, verticalAlign: "center", tokens: { childrenGap: 6 } },
                    React.createElement(Icon, { iconName: "WorkItem", className: styles.iconCargo }),
                    React.createElement(Text, { className: styles.cargo }, emp.Rol))),
            React.createElement(Separator, { className: styles.cardSeparator }),
            React.createElement(Stack, { horizontal: true, horizontalAlign: "space-between", verticalAlign: "center" },
                React.createElement(Text, { className: styles.idEmpleado },
                    "ID: ",
                    emp.Id),
                React.createElement(Icon, { iconName: "Contact", className: styles.iconContact })))); })) : (React.createElement(MessageBar, { messageBarType: MessageBarType.info }, "No se encontraron empleados."))),
        React.createElement(Modal, { isOpen: isOpen, onDismiss: function () { return setIsOpen(false); }, isBlocking: false, className: styles.modalFlotante },
            React.createElement("div", { className: styles.modalContent },
                React.createElement("div", { className: styles.modalHeader },
                    React.createElement(Text, { variant: "xLarge", className: styles.modalTitle }, editandoId ? "Actualizar Perfil" : "Nuevo Miembro del Equipo"),
                    React.createElement(IconButton, { iconProps: { iconName: 'Cancel' }, ariaLabel: "Cerrar", onClick: function () { return setIsOpen(false); } })),
                React.createElement(Separator, { className: styles.modalSeparator }),
                React.createElement(Stack, { tokens: { childrenGap: 15 }, className: styles.modalBody },
                    React.createElement(TextField, { label: "Nombre y Apellido", required: true, value: formulario.NombreyApellido, onChange: function (_, v) { return setFormulario(__assign(__assign({}, formulario), { NombreyApellido: v || "" })); } }),
                    React.createElement(Dropdown, { label: "Rol / Cargo", options: rolOptions, selectedKey: formulario.Rol, onChange: function (_, opt) { return setFormulario(__assign(__assign({}, formulario), { Rol: opt === null || opt === void 0 ? void 0 : opt.key })); } }),
                    React.createElement(Dropdown, { label: "Fotograf\u00EDa", options: fotoOptions, selectedKey: formulario.FotoPerfil, onChange: function (_, opt) { return setFormulario(__assign(__assign({}, formulario), { FotoPerfil: opt === null || opt === void 0 ? void 0 : opt.key })); } }),
                    formulario.FotoPerfil && (React.createElement("div", { className: styles.previewBox },
                        React.createElement(Stack, { horizontalAlign: "center", tokens: { childrenGap: 10 } },
                            React.createElement(Text, { variant: "small", className: styles.previewTitle }, "Vista previa del carnet:"),
                            React.createElement(Persona, { imageUrl: formulario.FotoPerfil, size: PersonaSize.size120, hidePersonaDetails: true }))))),
                React.createElement("div", { className: styles.modalFooter }, saving ? (React.createElement(Spinner, { label: "Procesando..." })) : (React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 10 }, horizontalAlign: "end" },
                    React.createElement(PrimaryButton, { text: editandoId ? "Actualizar" : "Registrar", onClick: handleGuardar, disabled: !formulario.NombreyApellido.trim(), className: styles.btnPanelPrimary }),
                    editandoId && (React.createElement(DefaultButton, { text: "Eliminar", onClick: function () { return setHideDeleteDialog(false); }, className: styles.btnDelete })),
                    React.createElement(DefaultButton, { text: "Cancelar", onClick: function () { return setIsOpen(false); } })))))),
        React.createElement(Dialog, { hidden: hideDeleteDialog, onDismiss: function () { return setHideDeleteDialog(true); }, dialogContentProps: {
                type: DialogType.normal,
                title: 'Confirmar eliminación',
                subText: "\u00BFEst\u00E1s seguro de que quieres eliminar a ".concat(formulario.NombreyApellido, "? Esta acci\u00F3n no se puede deshacer.")
            }, modalProps: { isBlocking: true } },
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { onClick: handleEliminar, text: "Eliminar", className: styles.btnConfirmDelete }),
                React.createElement(DefaultButton, { onClick: function () { return setHideDeleteDialog(true); }, text: "Cancelar" })))));
};
//# sourceMappingURL=GaleriaPersonal.js.map