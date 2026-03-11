import * as React from 'react';
import styles from './TablaObras.module.scss';
import { ProjectService } from '../../../service/ProjectService';
import { IObra } from '../../../models/IObra';
import { Icon } from '@fluentui/react/lib/Icon';

export interface ITableObrasProps {
  context: any;
}

export interface ITableObrasState {
  obras: IObra[];
  loading: boolean;
  nuevaObraTitle: string; 
}

export class TablaObras extends React.Component<ITableObrasProps, ITableObrasState> {
  private _projectService: ProjectService;

  constructor(props: ITableObrasProps) {
    super(props);
    this.state = {
      obras: [],
      loading: true,
      nuevaObraTitle: ''
    };
    this._projectService = new ProjectService(this.props.context);
  }

  public componentDidMount(): void {
    this._cargarObras();
  }

  // Cargamos las obras desde SharePoint
  private _cargarObras = async (): Promise<void> => {
    try {
      const listaObras = await this._projectService.getObras();
      this.setState({ obras: listaObras, loading: false });
    } catch (error) {
      console.error("Error al cargar obras:", error);
      this.setState({ loading: false });
    }
  }

  // Función para crear un nuevo proyecto
  private _guardarProyecto = async (): Promise<void> => {
    if (!this.state.nuevaObraTitle) {
      alert("Por favor, introduce un nombre para la obra");
      return;
    }

    try {
      await this._projectService.crearObra({
        Title: this.state.nuevaObraTitle,
        EstadoPresupuesto: 'PRESUPUESTO',
        EstadoObra: 'Pendiente'
      });
      
      this.setState({ nuevaObraTitle: '' }, () => {
        this._cargarObras();
      });
    } catch (error) {
      alert("Error al crear la obra. Revisa la consola.");
    }
  }

  // Función para eliminar una obra
  private _eliminarObra = async (id: number): Promise<void> => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proyecto definitivamente?")) {
      try {
        await this._projectService.eliminarObra(id);
        this._cargarObras();
      } catch (error) {
        alert("Error al eliminar la obra.");
      }
    }
  }

  // Función para editar el nombre de la obra (Edición rápida)
  private _editarNombreObra = async (obra: IObra): Promise<void> => {
    const nuevoNombre = window.prompt("Nuevo nombre para la obra:", obra.Title);
    if (nuevoNombre && nuevoNombre !== obra.Title) {
      try {
        await this._projectService.actualizarObra(obra.Id, { Title: nuevoNombre });
        this._cargarObras();
      } catch (error) {
        alert("Error al actualizar el nombre.");
      }
    }
  }

  public render(): React.ReactElement<ITableObrasProps> {
    return (
      <div className={styles.tableContainer}>
        <h2>Gestión de Proyectos y Obras</h2>

        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          marginBottom: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre del Proyecto / Obra</label>
            <input 
              type="text" 
              value={this.state.nuevaObraTitle} 
              onChange={(e) => this.setState({ nuevaObraTitle: e.target.value })}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Ej: Reforma Instalación Eléctrica Calle Mayor"
            />
          </div>
          <button 
            onClick={() => this._guardarProyecto()}
            style={{ 
              background: '#0078d4', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ Crear Obra
          </button>
        </div>

        {this.state.loading ? (
          <p>Cargando datos desde SharePoint...</p>
        ) : (
          <table className={styles.gridTable}>
            <thead>
              <tr>
                <th>Obra</th>
                <th>Cliente</th>
                <th>Estado Flujo</th>
                <th>Estado Obra</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {this.state.obras.map(obra => (
                <tr key={obra.Id}>
                  <td className={styles.bold}>{obra.Title}</td>
                  <td>{obra.Cliente?.Title || 'Sin cliente'}</td>
                  <td>
                    <span className={`${styles.badge} ${(styles as any)[obra.EstadoPresupuesto?.replace(/\s/g, '') || 'PRESUPUESTO']}`}>
                      {obra.EstadoPresupuesto}
                    </span>
                  </td>
                  <td>{obra.EstadoObra}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <Icon 
                        iconName="Edit" 
                        style={{ cursor: 'pointer', color: '#0078d4' }} 
                        onClick={() => this._editarNombreObra(obra)} 
                        title="Editar nombre"
                      />
                      <Icon 
                        iconName="Delete" 
                        style={{ cursor: 'pointer', color: '#d13438' }} 
                        onClick={() => this._eliminarObra(obra.Id)} 
                        title="Eliminar obra"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}