import * as React from "react";
import { Nav, Text } from "@fluentui/react";
import styles from "../Obras.module.scss";
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
export var Sidebar = function (props) {
    return (React.createElement("div", { className: "".concat(styles.sidebar, " ").concat(props.isOpen ? styles.isOpen : "") },
        React.createElement("div", { className: styles.logoArea },
            React.createElement(Text, { variant: "large", style: { fontWeight: "bold", color: "white" } }, "EWS ENERGY")),
        React.createElement(Nav, { selectedKey: props.selectedKey, groups: navGroups, onLinkClick: function (ev, item) {
                if (ev)
                    ev.preventDefault();
                if (item) {
                    props.onLinkClick(item.key);
                }
            } })));
};
//# sourceMappingURL=Sidebar.js.map