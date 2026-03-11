import * as React from 'react';
import styles from './Obras.module.scss';
import type { IObrasProps } from './IObrasProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { Stack, Text } from '@fluentui/react';

import { Sidebar } from './Navegacion/Sidebar';
import { ListaMateriales } from './Vistas/Inventario/ListaMateriales';
import { GaleriaPersonal } from './Vistas/Personal/GaleriaPersonal';

export default class Obras extends React.Component<IObrasProps, { items: any[], selectedKey: string }> {
  constructor(props: IObrasProps) {
    super(props);
    this.state = { items: [], selectedKey: 'inventario' };
  }

  public componentDidMount(): void { this._getListData(); }

  private _getListData = async () => {
    try {
      const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
      const response = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      if (response.ok) {
        const json = await response.json();
        this.setState({ items: json.value || [] });
      }
    } catch (e) { console.error("Error al cargar lista:", e); }
  }

  private _crearMaterial = async (nombre: string, stock: number, stockMin: number, categoria: string) => {
    try {
      const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
      await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
        headers: { 'Accept': 'application/json;odata=nometadata', 'Content-type': 'application/json;odata=nometadata' },
        body: JSON.stringify({ 
          'Title': nombre, 
          'StockActual': stock,
          'StockMinimo': stockMin,
          'Categoria': categoria
        })
      });
      this._getListData();
    } catch (e) { console.error("Error al añadir:", e); }
  }

  private _editarMaterial = async (id: number, nombre: string, stock: number, stockMin: number, categoria: string) => {
    try {
      const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items(${id})`;
      await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
        headers: { 'Accept': 'application/json;odata=nometadata', 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' },
        body: JSON.stringify({ 'Title': nombre, 'StockActual': stock, 'StockMinimo': stockMin, 'Categoria': categoria })
      });
      this._getListData();
    } catch (e) { console.error("Error al editar:", e); }
  }

  private _eliminarMaterial = async (id: number) => {
    try {
      const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items(${id})`;
      await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
        headers: { 'Accept': 'application/json;odata=nometadata', 'IF-MATCH': '*', 'X-HTTP-Method': 'DELETE' }
      });
      this._getListData();
    } catch (e) { console.error("Error al eliminar:", e); }
  }

  public render(): React.ReactElement<IObrasProps> {
    return (
      <section className={styles.obras}>
        <Stack horizontal className={styles.appWrapper}>
          <Sidebar selectedKey={this.state.selectedKey} onLinkClick={(key) => this.setState({ selectedKey: key })} />
          <main className={styles.mainContent}>
            <header className={styles.header}>
              <Text variant="medium"><b>EWS ENERGY</b> | {this.props.userDisplayName}</Text>
            </header>
            <div className={styles.pageBody}>
              {this.state.selectedKey === 'inventario' && (
                <ListaMateriales 
                  items={this.state.items} 
                  onAddMaterial={this._crearMaterial} 
                  onDeleteMaterial={this._eliminarMaterial}
                  onEditMaterial={this._editarMaterial}
                />
              )}
              {this.state.selectedKey === 'personal' && <GaleriaPersonal context={this.props.context} />}
            </div>
          </main>
        </Stack>
      </section>
    );
  }
}