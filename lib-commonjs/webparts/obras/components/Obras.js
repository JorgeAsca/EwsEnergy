"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Obras = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var Obras_module_scss_1 = tslib_1.__importDefault(require("./Obras.module.scss"));
var react_1 = require("@fluentui/react");
var Sidebar_1 = require("./Navegacion/Sidebar");
// Vistas
var ListaMateriales_1 = require("./Vistas/Inventario/ListaMateriales");
var GaleriaPersonal_1 = require("./Vistas/Personal/GaleriaPersonal");
var TablaObras_1 = require("./Vistas/Proyectos/TablaObras");
var VistaAsignaciones_1 = require("./Vistas/Asignaciones/VistaAsignaciones");
var VistaFotosObra_1 = require("./Vistas/Fotos/VistaFotosObra");
var VistaPlanificacion_1 = require("./Vistas/Planificacion/VistaPlanificacion");
var VistaHistorialReportes_1 = require("./Vistas/historial/VistaHistorialReportes");
var Obras = function (props) {
    var _a = React.useState('obras'), selectedKey = _a[0], setSelectedKey = _a[1];
    var _b = React.useState(false), isMenuOpen = _b[0], setIsMenuOpen = _b[1];
    var renderPage = function () {
        switch (selectedKey) {
            case 'inventario': return React.createElement(ListaMateriales_1.ListaMateriales, { context: props.context });
            case 'personal': return React.createElement(GaleriaPersonal_1.GaleriaPersonal, { context: props.context });
            case 'obras': return React.createElement(TablaObras_1.TablaObras, { context: props.context });
            case 'planificacion': return React.createElement(VistaPlanificacion_1.VistaPlanificacion, { context: props.context });
            case 'asignaciones': return React.createElement(VistaAsignaciones_1.VistaAsignaciones, { context: props.context });
            case 'fotos': return React.createElement(VistaFotosObra_1.VistaFotosObra, { context: props.context });
            case 'historial': return React.createElement(VistaHistorialReportes_1.VistaHistorialTarjetas, { context: props.context });
            default: return React.createElement(TablaObras_1.TablaObras, { context: props.context });
        }
    };
    return (React.createElement("section", { className: Obras_module_scss_1.default.obras },
        React.createElement("div", { className: Obras_module_scss_1.default.appWrapper },
            React.createElement(Sidebar_1.Sidebar, { selectedKey: selectedKey, isOpen: isMenuOpen, onLinkClick: function (key) {
                    setSelectedKey(key);
                    setIsMenuOpen(false); // Cierra el menú al navegar en móvil
                } }),
            React.createElement("main", { className: Obras_module_scss_1.default.mainContent },
                React.createElement("header", { className: Obras_module_scss_1.default.header },
                    React.createElement("div", { className: Obras_module_scss_1.default.headerLeft },
                        React.createElement(react_1.IconButton, { iconProps: { iconName: 'GlobalNavButton' }, className: Obras_module_scss_1.default.menuButton, onClick: function () { return setIsMenuOpen(!isMenuOpen); }, title: "Men\u00FA" })),
                    React.createElement("div", { className: Obras_module_scss_1.default.headerRight },
                        React.createElement(react_1.Text, { variant: "medium" },
                            "Usuario: ",
                            React.createElement("b", null, props.userDisplayName)))),
                React.createElement("div", { className: Obras_module_scss_1.default.pageBody }, renderPage())),
            isMenuOpen && React.createElement("div", { className: Obras_module_scss_1.default.overlay, onClick: function () { return setIsMenuOpen(false); } }))));
};
exports.Obras = Obras;
exports.default = exports.Obras;
//# sourceMappingURL=Obras.js.map