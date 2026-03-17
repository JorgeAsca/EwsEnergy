import * as React from 'react';
import styles from './Obras.module.scss';
import type { IObrasProps } from './IObrasProps';
import { Stack, Text } from '@fluentui/react';
import { Sidebar } from './Navegacion/Sidebar';
import { ListaMateriales } from './Vistas/Inventario/ListaMateriales';
import { GaleriaPersonal } from './Vistas/Personal/GaleriaPersonal';
import { TablaObras } from './Vistas/Proyectos/TablaObras';
import { VistaAsignaciones } from './Vistas/Asignaciones/VistaAsignaciones';
import { VistaFotosObra } from './Vistas/Fotos/VistaFotosObra';

export default class Obras extends React.Component<IObrasProps, { selectedKey: string }> {
  constructor(props: IObrasProps) {
    super(props);
    this.state = { selectedKey: 'obras' };
  }

  public render(): React.ReactElement<IObrasProps> {
    return (
      <section className={styles.obras}>
        <Stack horizontal className={styles.appWrapper}>
          <Sidebar 
            selectedKey={this.state.selectedKey} 
            onLinkClick={(key) => this.setState({ selectedKey: key })} 
          />
          <main className={styles.mainContent}>
            <header className={styles.header}>
              <Text variant="medium">Usuario: <b>{this.props.userDisplayName}</b></Text>
            </header>
            <div className={styles.pageBody}>
              {this.state.selectedKey === 'inventario' && <ListaMateriales context={this.props.context} />}
              {this.state.selectedKey === 'personal' && <GaleriaPersonal context={this.props.context} />}
              {this.state.selectedKey === 'obras' && <TablaObras context={this.props.context} />}
              {this.state.selectedKey === 'asignaciones' && <VistaAsignaciones context={this.props.context} />}
              {this.state.selectedKey === 'fotos' && <VistaFotosObra context={this.props.context} />}
            </div>
          </main>
        </Stack>
      </section>
    );
  }
}