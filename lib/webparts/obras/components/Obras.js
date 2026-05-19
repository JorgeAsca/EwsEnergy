import * as React from 'react';
import styles from './Obras.module.scss';
import { IconButton, Text } from '@fluentui/react';
import { Sidebar } from './Navegacion/Sidebar';
// Vistas
import { ListaMateriales } from './Vistas/Inventario/ListaMateriales';
import { GaleriaPersonal } from './Vistas/Personal/GaleriaPersonal';
import { TablaObras } from './Vistas/Proyectos/TablaObras';
import { VistaAsignaciones } from './Vistas/Asignaciones/VistaAsignaciones';
import { VistaFotosObra } from './Vistas/Fotos/VistaFotosObra';
import { VistaPlanificacion } from './Vistas/Planificacion/VistaPlanificacion';
import { VistaHistorialTarjetas } from './Vistas/historial/VistaHistorialReportes';
export var Obras = function (props) {
    var _a = React.useState('obras'), selectedKey = _a[0], setSelectedKey = _a[1];
    var _b = React.useState(false), isMenuOpen = _b[0], setIsMenuOpen = _b[1];
    var renderPage = function () {
        switch (selectedKey) {
            case 'inventario': return React.createElement(ListaMateriales, { context: props.context });
            case 'personal': return React.createElement(GaleriaPersonal, { context: props.context });
            case 'obras': return React.createElement(TablaObras, { context: props.context });
            case 'planificacion': return React.createElement(VistaPlanificacion, { context: props.context });
            case 'asignaciones': return React.createElement(VistaAsignaciones, { context: props.context });
            case 'fotos': return React.createElement(VistaFotosObra, { context: props.context });
            case 'historial': return React.createElement(VistaHistorialTarjetas, { context: props.context });
            default: return React.createElement(TablaObras, { context: props.context });
        }
    };
    return (React.createElement("section", { className: styles.obras },
        React.createElement("div", { className: styles.appWrapper },
            React.createElement(Sidebar, { selectedKey: selectedKey, isOpen: isMenuOpen, onLinkClick: function (key) {
                    setSelectedKey(key);
                    setIsMenuOpen(false); // Cierra el menú al navegar en móvil
                } }),
            React.createElement("main", { className: styles.mainContent },
                React.createElement("header", { className: styles.header },
                    React.createElement("div", { className: styles.headerLeft },
                        React.createElement(IconButton, { iconProps: { iconName: 'GlobalNavButton' }, className: styles.menuButton, onClick: function () { return setIsMenuOpen(!isMenuOpen); }, title: "Men\u00FA" })),
                    React.createElement("div", { className: styles.headerRight },
                        React.createElement(Text, { variant: "medium" },
                            "Usuario: ",
                            React.createElement("b", null, props.userDisplayName)))),
                React.createElement("div", { className: styles.pageBody }, renderPage())),
            isMenuOpen && React.createElement("div", { className: styles.overlay, onClick: function () { return setIsMenuOpen(false); } }))));
};
export default Obras;
//# sourceMappingURL=Obras.js.map