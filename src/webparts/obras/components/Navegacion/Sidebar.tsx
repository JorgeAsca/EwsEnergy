import * as React from "react";
import { Nav, INavLinkGroup, INavLink, Text } from "@fluentui/react";
import styles from "../Obras.module.scss";

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
      {name: "Asignaciones", url: "", key: "asignaciones",icon: "ContactLink" },
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
