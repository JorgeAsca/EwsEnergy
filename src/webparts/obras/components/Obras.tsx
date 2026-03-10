import * as React from 'react';
import styles from './Obras.module.scss';
import type { IObrasProps } from './IObrasProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

interface IObrasState {
  items: any[];
  nuevoMaterial: string;
  nuevoStock: number;
}

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
    this._getListData();
  }

  // Leer datos de la lista "Inventario de Materiales"
  private _getListData = async (): Promise<void> => {
    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
    
    const response: SPHttpClientResponse = await this.props.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const jsonResponse = await response.json();
    this.setState({ items: jsonResponse.value });
  }

  // Guardar un nuevo material
  private _crearMaterial = async (): Promise<void> => {
    const url = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Inventario de Materiales')/items`;
    
    const body: string = JSON.stringify({
      'Title': this.state.nuevoMaterial, // El campo interno por defecto es Title
      'StockActual': this.state.nuevoStock // Asegúrate que el nombre interno sea exacto
    });

    await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      body: body
    });

    alert("Material guardado!");
    this._getListData(); // Refrescar lista
  }

  public render(): React.ReactElement<IObrasProps> {
    return (
      <section className={styles.obras}>
        <div className={styles.welcome}>
          <h2>Gestión de Stock - EWS</h2>
          <p>Usuario: {this.props.userDisplayName}</p>
        </div>

        <div className={styles.container}>
          {/* Formulario Simple */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>Agregar Nuevo Material</h3>
            <input 
              type="text" 
              placeholder="Nombre del material" 
              onChange={(e) => this.setState({ nuevoMaterial: e.target.value })} 
            />
            <input 
              type="number" 
              placeholder="Stock" 
              onChange={(e) => this.setState({ nuevoStock: parseInt(e.target.value) })} 
            />
            <button onClick={() => this._crearMaterial()}>Guardar en SharePoint</button>
          </div>

          {/* Tabla de Resultados */}
          <h3>Inventario Actual</h3>
          <table style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Material</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.Title}</td>
                  <td>{item.StockActual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}