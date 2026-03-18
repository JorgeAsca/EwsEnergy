import * as React from "react";
import { Nav, INavLinkGroup, INavLink, Text } from "@fluentui/react";
import styles from "../Obras.module.scss";

// Nota: En el Sidebar no importamos las Vistas (como VistaHistorialTarjetas) 
// porque este componente solo emite la "key" hacia el padre (Obras.tsx),
// quien es el encargado de decidir qué componente mostrar.

interface ISidebarProps {
  selectedKey: string;
  onLinkClick: (key: string) => void;
}

const navGroups: INavLinkGroup[] = [
  {
    links: [
      { name: "Inventario", url: "", key: "inventario", icon: "Package" },
      { name: "Personal", url: "", key: "personal", icon: "Group" },
      { name: "Obras", url: "", key: "obras", icon: "ConstructionCone" },
      { name: "Planificación", url: "", key: "planificacion", icon: "Calendar" }, 
      { name: "Asignaciones", url: "", key: "asignaciones", icon: "ContactLink" },
      { name: "Fotos Diarias", url: "", key: "fotos", icon: "Camera" },
      // Esta es la clave que activa el componente VistaHistorialTarjetas en Obras.tsx
      { name: "Control de Obras", url: "", key: "historial", icon: "History" },
    ],
  },
];

export const Sidebar: React.FC<ISidebarProps> = (props) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logoArea}>
        <Text variant="large" style={{ fontWeight: "bold", color: "white" }}>
          EWS ENERGY
        </Text>
      </div>
      <Nav
        selectedKey={props.selectedKey}
        groups={navGroups}
        onLinkClick={(ev, item?: INavLink) => {
          if (ev) ev.preventDefault();
          if (item) props.onLinkClick(item.key as string);
        }}
      />
    </div>
  );
};