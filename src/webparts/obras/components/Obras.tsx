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
  Icon
} from '@fluentui/react';

interface IObrasState {
  items: any[];
  nuevoMaterial: string;
  nuevoStock: number;
}

const columns: IColumn[] = [
  { key: 'icon', name: '', fieldName: 'icon', minWidth: 20, maxWidth: 20, onRender: () => <Icon iconName="Package" /> },
  { key: 'col1', name: 'Material', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
  { key: 'col2', name: 'Stock Actual', fieldName: 'StockActual', minWidth: 70, maxWidth: 100, isResizable: true },
];

export default class Obras extends React.Component<IObrasProps, IObrasState> {
  
  constructor(props: IObrasProps) {
    super(props);
    this.state = {
      items: [],
      nuevoMaterial: '',
      nuevoStock: 0
    };
  }

  public componentDidMount(): void {
    this._getListData().catch(err => console.error(err));
  }

  // FUNCIÓN: Leer datos de SharePoint
  private _getListData = async (): Promise<void> => {
    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
    
    const response: SPHttpClientResponse = await this.props.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const jsonResponse = await response.json();
    this.setState({ items: jsonResponse.value });
  }

  // FUNCIÓN: Crear material en SharePoint
  private _crearMaterial = async (): Promise<void> => {
    if (!this.state.nuevoMaterial) {
      alert("Por favor, escribe un nombre");
      return;
    }

    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
    
    const body: string = JSON.stringify({
      'Title': this.state.nuevoMaterial,
      'StockActual': this.state.nuevoStock
    });

    await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      body: body
    });

    alert("¡Material guardado correctamente!");
    await this._getListData(); // Refrescar la tabla
  }

  public render(): React.ReactElement<IObrasProps> {
    return (
      <section className={styles.obras}>
        <Stack className={styles.container} tokens={{ childrenGap: 20 }}>
          
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
            <Text variant="xxLarge" style={{ color: '#004a99', fontWeight: 600 }}>
              🚀 Gestión de Stock EWS
            </Text>
            <Text variant="medium">Usuario: <b>{this.props.userDisplayName}</b></Text>
          </Stack>

          <Separator />

          <Stack tokens={{ childrenGap: 15 }} className={styles.formCard}>
            <Text variant="large" style={{ fontWeight: 600 }}>Añadir Nuevo Material</Text>
            <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="end">
              <TextField 
                label="Nombre del Material" 
                placeholder="Ej: Cable 2.5mm"
                onChange={(_, val) => this.setState({ nuevoMaterial: val || '' })} 
                styles={{ root: { width: 300 } }}
              />
              <TextField 
                label="Stock" 
                type="number"
                value={this.state.nuevoStock.toString()}
                onChange={(_, val) => this.setState({ nuevoStock: parseInt(val || '0') })} 
                styles={{ root: { width: 100 } }}
              />
              <PrimaryButton 
                text="Guardar" 
                onClick={() => { this._crearMaterial().catch((e: Error) => console.error(e)); }} 
                iconProps={{ iconName: 'Add' }}
              />
            </Stack>
          </Stack>

          <Stack tokens={{ childrenGap: 10 }}>
            <Text variant="large" style={{ fontWeight: 600 }}>Inventario Actual</Text>
            <div className={styles.tableContainer}>
              <DetailsList
                items={this.state.items}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
              />
            </div>
          </Stack>

        </Stack>
      </section>
    );
  }
}