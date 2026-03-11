import * as React from 'react';
import styles from './TablaObras.module.scss';
import { ProjectService } from '../../../service/ProjectService';
import { PersonalService } from '../../../service/PersonalService';
import { IObra } from '../../../models/IObra';
import { IPersonal } from '../../../models/IPersonal';

export interface ITableObrasProps {
  context: any;
}

export const TablaObras: React.FC<ITableObrasProps> = (props) => {
  const [obras, setObras] = React.useState<IObra[]>([]);
  const [personal, setPersonal] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const projectService = new ProjectService(props.context);
  const personalService = new PersonalService(props.context);

  // Carga inicial de datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [listaObras, listaPersonal] = await Promise.all([
        projectService.getObras(),
        personalService.getPersonal()
      ]);
      setObras(listaObras);
      setPersonal(listaPersonal);
    } catch (error) {
      console.error("Error cargando datos en TablaObras:", error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cambiar el estado de la obra
  const cambiarEstado = async (obraId: number, nuevoEstado: string) => {
    try {
      await projectService.actualizarEstado(obraId, nuevoEstado);
      cargarDatos(); // Refrescar para ver los cambios
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  // Función para asignar personal
  const asignarResponsable = async (obraId: number, trabajadorId: string) => {
    if (!trabajadorId) return;
    try {
      
      await projectService.asignarPersonalAObra(obraId, parseInt(trabajadorId));
      cargarDatos();
    } catch (error) {
      alert("Error al asignar personal");
    }
  };

  if (loading) return <div className={styles.loader}>Cargando panel de obras...</div>;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <h2>Gestión de Proyectos y Obras</h2>
        <button className={styles.btnNuevo} onClick={() => alert('Abrir formulario nueva obra')}>
          + Nueva Obra
        </button>
      </div>

      <table className={styles.gridTable}>
        <thead>
          <tr>
            <th>Nombre de Obra</th>
            <th>Cliente</th>
            <th>Responsable Asignado</th>
            <th>Estado Flujo</th>
            <th>Estado Obra</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {obras.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign: 'center'}}>No hay obras registradas.</td></tr>
          ) : (
            obras.map(obra => (
              <tr key={obra.Id}>
                <td className={styles.bold}>{obra.Title}</td>
                <td>{obra.Cliente?.Title || 'Sin Cliente'}</td>
                <td>
                  <select 
                    className={styles.selectAssign}
                    onChange={(e) => asignarResponsable(obra.Id, e.target.value)}
                    value={obra.PersonalAsignadoId || ""} 
                  >
                    <option value="">Seleccionar...</option>
                    {personal.map(p => (
                      <option key={p.Id} value={p.Id}>{p.Title}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`${styles.badge} ${(styles as any)[obra.EstadoPresupuesto.replace(/\s/g, '')]}`}>
                    {obra.EstadoPresupuesto}
                  </span>
                </td>
                <td>
                  <select 
                    value={obra.EstadoObra} 
                    className={styles.selectEstado}
                    onChange={(e) => cambiarEstado(obra.Id, e.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </td>
                <td>
                  <button className={styles.btnDetalle} onClick={() => alert('Ver fotos y diario')}>
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};