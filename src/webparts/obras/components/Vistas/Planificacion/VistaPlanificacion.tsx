import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { 
  Stack, Text, Persona, PersonaSize, Spinner, SpinnerSize, 
  Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton,
  TextField, IconButton 
} from '@fluentui/react';
import { ProjectService } from '../../../service/ProjectService';
import { PersonalService } from '../../../service/PersonalService';
import { AsignacionesService } from '../../../service/AsignacionesService';
import { IObra } from '../../../models/IObra';
import { IPersonal } from '../../../models/IPersonal';
import { IAsignacion } from '../../../models/IAsignacion';
import styles from './VistaPlanificacion.module.scss';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

interface IObraPendiente {
  nombre: string;
  motivo: string;
}

export const VistaPlanificacion: React.FC<{ context: WebPartContext }> = ({ context }) => {
  // 1. ESTADOS
  const [obras, setObras] = React.useState<IObra[]>([]);
  const [personalDisponible, setPersonalDisponible] = React.useState<IPersonal[]>([]);
  const [asignaciones, setAsignaciones] = React.useState<IAsignacion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedAsig, setSelectedAsig] = React.useState<{asig: IAsignacion, persona: IPersonal} | null>(null);
  
  // Estados para obras pendientes
  const [obrasPendientes, setObrasPendientes] = React.useState<IObraPendiente[]>([]);
  const [showAddPending, setShowAddPending] = React.useState(false);
  const [newPending, setNewPending] = React.useState<IObraPendiente>({ nombre: '', motivo: '' });

  // 2. SERVICIOS
  const services = React.useMemo(() => ({
    project: new ProjectService(context),
    personal: new PersonalService(context),
    asig: new AsignacionesService(context)
  }), [context]);

  // 3. FUNCIONES DE LÓGICA
  const getFechaPorDia = (nombreDia: string): Date => {
    const hoy = new Date();
    const lunes = new Date(hoy.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1));
    const index = DIAS_SEMANA.indexOf(nombreDia);
    const fechaResultado = new Date(lunes);
    fechaResultado.setDate(lunes.getDate() + index);
    return fechaResultado;
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [o, p, a] = await Promise.all([
        services.project.getObras(),
        services.personal.getPersonal(),
        services.asig.getAsignaciones()
      ]);
      setObras(o);
      setPersonalDisponible(p);
      setAsignaciones(a);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { cargarDatos(); }, []);

  // 4. MANEJADORES DE EVENTOS
  const onDrop = async (ev: React.DragEvent, obraId: number, dia: string) => {
    ev.preventDefault();
    const personId = parseInt(ev.dataTransfer.getData("personId"));
    const fecha = getFechaPorDia(dia);

    await services.asig.asignarPersonal({
      ObraId: obraId,
      PersonalId: personId,
      FechaInicio: fecha,
      FechaFinPrevista: fecha,
      EstadoProgreso: 0
    });
    await cargarDatos();
  };

  const eliminarAsignacion = async () => {
    if (!selectedAsig?.asig.Id) return;
    try {
      setLoading(true);
      await services.asig.eliminarAsignacion(selectedAsig.asig.Id);
      setSelectedAsig(null);
      await cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarObraPendiente = () => {
    if (newPending.nombre && newPending.motivo) {
      setObrasPendientes([...obrasPendientes, newPending]);
      setNewPending({ nombre: '', motivo: '' });
      setShowAddPending(false);
    }
  };

  if (loading) return <Spinner label="Actualizando cuadrante..." size={SpinnerSize.large} />;

  return (
    <Stack tokens={{ childrenGap: 20 }} className={styles.vistaPlanificacion}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge">Planificación Semanal Real</Text>
        <PrimaryButton iconProps={{ iconName: 'Add' }} text="Anotar Obra Pendiente" onClick={() => setShowAddPending(true)} />
      </Stack>
      
      <Stack horizontal tokens={{ childrenGap: 20 }}>
        {/* Panel Personal */}
        <div className={styles.personalPanel}>
          <Text variant="large" className={styles.panelTitulo}>Personal</Text>
          <div className={styles.personalList}>
            {personalDisponible.map(p => (
              <div key={p.Id} draggable onDragStart={(e) => e.dataTransfer.setData("personId", p.Id.toString())} className={styles.draggablePersona}>
                <Persona text={p.NombreyApellido} imageUrl={p.FotoPerfil} size={PersonaSize.size32} />
              </div>
            ))}
          </div>
        </div>

        {/* Tabla principal */}
        <div className={styles.tableContainer}>
          <table className={styles.planTable}>
            <thead>
              <tr>
                <th style={{ width: '200px' }}>Obra</th>
                {DIAS_SEMANA.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {obras.map(obra => (
                <tr key={obra.Id}>
                  <td className={styles.cellObra}><span>{obra.Title}</span></td>
                  {DIAS_SEMANA.map(dia => {
                    const fechaDia = getFechaPorDia(dia).toDateString();
                    const asigsEnDia = asignaciones.filter(a => 
                      a.ObraId === obra.Id && new Date(a.FechaInicio).toDateString() === fechaDia
                    );
                    return (
                      <td key={dia} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, obra.Id, dia)} className={styles.dropZone}>
                        <div className={styles.asignadosConsola}>
                          {asigsEnDia.map(a => {
                            const p = personalDisponible.find(pers => pers.Id === a.PersonalId);
                            return p ? (
                              <div key={a.Id} onClick={() => setSelectedAsig({asig: a, persona: p})} className={styles.fotoAsignada}>
                                <Persona imageUrl={p.FotoPerfil} size={PersonaSize.size32} hidePersonaDetails />
                              </div>
                            ) : null;
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel Pendientes */}
        <div className={styles.pendingPanel}>
          <Text variant="large" className={styles.panelTitulo}>Pendientes</Text>
          <div className={styles.pendingList}>
            {obrasPendientes.map((op, idx) => (
              <div key={idx} className={styles.pendingItem}>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                  <Text className={styles.pendingName}>{op.nombre}</Text>
                  <IconButton iconProps={{ iconName: 'Delete' }} onClick={() => setObrasPendientes(obrasPendientes.filter((_, i) => i !== idx))} />
                </Stack>
                <Text className={styles.pendingReason}>{op.motivo}</Text>
              </div>
            ))}
          </div>
        </div>
      </Stack>

      {/* Diálogos */}
      <Dialog hidden={!showAddPending} onDismiss={() => setShowAddPending(false)} dialogContentProps={{ type: DialogType.normal, title: 'Nueva Obra Pendiente' }}>
        <TextField label="Nombre" value={newPending.nombre} onChange={(_, v) => setNewPending({...newPending, nombre: v || ''})} />
        <TextField label="Motivo" multiline rows={3} value={newPending.motivo} onChange={(_, v) => setNewPending({...newPending, motivo: v || ''})} />
        <DialogFooter>
          <PrimaryButton onClick={agregarObraPendiente} text="Añadir" />
          <DefaultButton onClick={() => setShowAddPending(false)} text="Cancelar" />
        </DialogFooter>
      </Dialog>

      <Dialog hidden={!selectedAsig} onDismiss={() => setSelectedAsig(null)} dialogContentProps={{ type: DialogType.normal, title: 'Gestionar Asignación' }}>
        <DialogFooter>
          <PrimaryButton onClick={eliminarAsignacion} text="Eliminar" />
          <DefaultButton onClick={() => setSelectedAsig(null)} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};