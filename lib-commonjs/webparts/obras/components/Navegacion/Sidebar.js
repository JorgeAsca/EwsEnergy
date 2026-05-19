"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var Obras_module_scss_1 = tslib_1.__importDefault(require("../Obras.module.scss"));
var navGroups = [
    {
        links: [
            { name: "Inventario", url: "", key: "inventario", icon: "Package" },
            { name: "Personal", url: "", key: "personal", icon: "Group" },
            { name: "Obras", url: "", key: "obras", icon: "ConstructionCone" },
            { name: "Planificación", url: "", key: "planificacion", icon: "Calendar" },
            { name: "Asignaciones", url: "", key: "asignaciones", icon: "ContactLink" },
            { name: "Diario", url: "", key: "fotos", icon: "Camera" },
            { name: "Control de Obras", url: "", key: "historial", icon: "History" },
        ],
    },
];
var Sidebar = function (props) {
    return (React.createElement("div", { className: "".concat(Obras_module_scss_1.default.sidebar, " ").concat(props.isOpen ? Obras_module_scss_1.default.isOpen : "") },
        React.createElement("div", { className: Obras_module_scss_1.default.logoArea },
            React.createElement(react_1.Text, { variant: "large", style: { fontWeight: "bold", color: "white" } }, "EWS ENERGY")),
        React.createElement(react_1.Nav, { selectedKey: props.selectedKey, groups: navGroups, onLinkClick: function (ev, item) {
                if (ev)
                    ev.preventDefault();
                if (item) {
                    props.onLinkClick(item.key);
                }
            } })));
};
exports.Sidebar = Sidebar;
//# sourceMappingURL=Sidebar.js.map