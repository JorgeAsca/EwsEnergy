import * as React from 'react';
import styles from './Obras.module.scss';
import type { IObrasProps } from './IObrasProps';
import { IconButton, Text } from '@fluentui/react';
import { Sidebar } from './Navegacion/Sidebar';

// 1. Importamos PnPjs para poder inicializarlo
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

// Vistas
import { ListaMateriales } from './Vistas/Inventario/ListaMateriales';
import { GaleriaPersonal } from './Vistas/Personal/GaleriaPersonal';
import { TablaObras } from './Vistas/Proyectos/TablaObras';
import { VistaAsignaciones } from './Vistas/Asignaciones/VistaAsignaciones';
import { VistaFotosObra } from './Vistas/Fotos/VistaFotosObra';
import { VistaPlanificacion } from './Vistas/Planificacion/VistaPlanificacion';
import { VistaHistorialTarjetas } from './Vistas/historial/VistaHistorialReportes';

export const Obras: React.FC<IObrasProps> = (props) => {
  const [selectedKey, setSelectedKey] = React.useState<string>('obras');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // 2. Inicializamos el objeto "sp" (PnPjs) usando el context clásico
  const sp = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  const renderPage = () => {
    switch (selectedKey) {
      // Estas vistas siguen usando el context antiguo (aún no migradas)
      case 'inventario': return <ListaMateriales context={props.context} />;
      case 'personal': return <GaleriaPersonal context={props.context} />;
      case 'asignaciones': return <VistaAsignaciones context={props.context} />;
      case 'fotos': return <VistaFotosObra context={props.context} />;
      case 'historial': return <VistaHistorialTarjetas context={props.context} />;
      
      // 3. Estas dos vistas ya las migramos a PnPjs, así que les pasamos 'sp'
      case 'obras': return <TablaObras sp={sp} />;
      case 'planificacion': return <VistaPlanificacion sp={sp} />;
      default: return <TablaObras sp={sp} />;
    }
  };

  return (
    <section className={styles.obras}>
      <div className={styles.appWrapper}>
        <Sidebar 
          selectedKey={selectedKey} 
          isOpen={isMenuOpen}
          onLinkClick={(key) => {
            setSelectedKey(key);
            setIsMenuOpen(false); // Cierra el menú al navegar en móvil
          }} 
        />
        
        <main className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <IconButton 
                iconProps={{ iconName: 'GlobalNavButton' }} 
                className={styles.menuButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Menú"
              />
            </div>
            <div className={styles.headerRight}>
              <Text variant="medium">Usuario: <b>{props.userDisplayName}</b></Text>
            </div>
          </header>
          
          <div className={styles.pageBody}>
            {renderPage()}
          </div>
        </main>

        {/* Capa para cerrar el menú en móvil */}
        {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}
      </div>
    </section>
  );
};

export default Obras;