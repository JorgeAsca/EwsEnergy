import * as React from 'react';
import styles from './Obras.module.scss';
import type { IObrasProps } from './IObrasProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { 
  Stack, 
  TextField, 
  PrimaryButton, 
  DetailsList, 
  DetailsListLayoutMode, 
  SelectionMode, 
  Text, 
  Separator, 
  IColumn,
  Icon,
  Nav,
  INavLinkGroup,
  INavLink
} from '@fluentui/react';

type ViewKey = 'inventario' | 'personal' | 'obras';

interface IObrasState {
  items: any[];
  nuevoMaterial: string;
  nuevoStock: number;
  selectedKey: ViewKey;
}

const columns: IColumn[] = [
  { key: 'icon', name: '', fieldName: 'icon', minWidth: 20, maxWidth: 20, onRender: () => <Icon iconName="Package" /> },
  { key: 'col1', name: 'Material', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
  { key: 'col2', name: 'Stock Actual', fieldName: 'StockActual', minWidth: 70, maxWidth: 100, isResizable: true },
];

const navGroups: INavLinkGroup[] = [
  {
    links: [
      { name: 'Inventario', url: '', key: 'inventario', icon: 'Package' },
      { name: 'Personal', url: '', key: 'personal', icon: 'Group' },
      { name: 'Obras', url: '', key: 'obras', icon: 'ConstructionCone' },
    ],
  },
];

export default class Obras extends React.Component<IObrasProps, IObrasState> {
  
  constructor(props: IObrasProps) {
    super(props);
    this.state = {
      items: [],
      nuevoMaterial: '',
      nuevoStock: 0,
      selectedKey: 'inventario'
    };
  }

  public componentDidMount(): void {
    this._getListData().catch((err: Error) => console.error(err));
  }

  private _getListData = async (): Promise<void> => {
    try {
      const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
      const response: SPHttpClientResponse = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const jsonResponse = await response.json();
      this.setState({ items: jsonResponse.value || [] });
    } catch (error) {
      console.error("Error cargando lista:", error);
    }
  }

  private _crearMaterial = async (): Promise<void> => {
    if (!this.state.nuevoMaterial) return;
    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
    
    await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: { 
        'Accept': 'application/json;odata=nometadata', 
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': '' 
      },
      body: JSON.stringify({ 'Title': this.state.nuevoMaterial, 'StockActual': this.state.nuevoStock })
    });

    this.setState({ nuevoMaterial: '', nuevoStock: 0 });
    await this._getListData();
  }

  private _onLinkClick = (ev?: React.MouseEvent<HTMLElement>, item?: INavLink): void => {
    if (ev) ev.preventDefault();
    if (item && item.key) {
      this.setState({ selectedKey: item.key as ViewKey });
    }
  }

  private _renderContent(): React.ReactElement {
    switch (this.state.selectedKey) {
      case 'personal':
        return (
          <Stack tokens={{ childrenGap: 20 }}>
            <Text variant="xxLarge">👥 Gestión de Personal</Text>
            <Text>Contenido de Personal en desarrollo...</Text>
          </Stack>
        );
      case 'obras':
        return (
          <Stack tokens={{ childrenGap: 20 }}>
            <Text variant="xxLarge">🏗️ Control de Obras</Text>
            <Text>Contenido de Obras en desarrollo...</Text>
          </Stack>
        );
      default:
        return (
          <Stack tokens={{ childrenGap: 20 }}>
            <Text variant="xxLarge" style={{ color: '#004a99', fontWeight: 600 }}>📦 Inventario EWS</Text>
            
            <Stack className={styles.formCard} tokens={{ childrenGap: 15 }}>
              <Text variant="large" style={{ fontWeight: 600 }}>Añadir Material</Text>
              <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="end">
                <TextField 
                  label="Nombre" 
                  onChange={(_, v) => this.setState({ nuevoMaterial: v || '' })} 
                  value={this.state.nuevoMaterial} 
                />
                <TextField 
                  label="Stock" 
                  type="number" 
                  onChange={(_, v) => this.setState({ nuevoStock: parseInt(v || '0') })} 
                  value={this.state.nuevoStock.toString()} 
                />
                <PrimaryButton 
                  text="Añadir" 
                  onClick={() => { this._crearMaterial().catch((e: Error) => console.error(e)); }} 
                  iconProps={{ iconName: 'Add' }} 
                />
              </Stack>
            </Stack>

            <div className={styles.tableContainer}>
              <DetailsList 
                items={this.state.items} 
                columns={columns} 
                layoutMode={DetailsListLayoutMode.justified} 
                selectionMode={SelectionMode.none} 
              />
            </div>
          </Stack>
        );
    }
  }

  public render(): React.ReactElement<IObrasProps> {
    return (
      <section className={styles.obras}>
        <Stack horizontal className={styles.appWrapper}>
          
          <div className={styles.sidebar}>
            <div className={styles.logoArea}>
              <Text variant="large" style={{ fontWeight: 'bold' }}>EWS ENERGY</Text>
            </div>
            <Nav
              groups={navGroups}
              selectedKey={this.state.selectedKey}
              onLinkClick={this._onLinkClick}
            />
          </div>

          <main className={styles.mainContent}>
            <header className={styles.header}>
              <Text variant="medium">Usuario: <b>{this.props.userDisplayName}</b></Text>
            </header>
            <div className={styles.pageBody}>
              {this._renderContent()}
            </div>
          </main>

        </Stack>
      </section>
    );
  }
}