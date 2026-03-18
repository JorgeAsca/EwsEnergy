import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { 
  Stack, Text, Persona, PersonaSize, Spinner, SpinnerSize, 
  Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton 
} from '@fluentui/react';
import { ProjectService } from '../../../service/ProjectService';
import { PersonalService } from '../../../service/PersonalService';
import { AsignacionesService } from '../../../service/AsignacionesService';
import { IObra } from '../../../models/IObra';
import { IPersonal } from '../../../models/IPersonal';
import { IAsignacion } from '../../../models/IAsignacion';
import styles from './VistaPlanificacion.module.scss';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const VistaPlanificacion: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const [obras, setObras] = React.useState<IObra[]>([]);
  const [personalDisponible, setPersonalDisponible] = React.useState<IPersonal[]>([]);
  const [asignaciones, setAsignaciones] = React.useState<IAsignacion[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estado para el diálogo de edición
  const [selectedAsig, setSelectedAsig] = React.useState<{asig: IAsignacion, persona: IPersonal} | null>(null);

  const services = React.useMemo(() => ({
    project: new ProjectService(context),
    personal: new PersonalService(context),
    asig: new AsignacionesService(context)
  }), [context]);

  // Función 1: Cálculo de fecha real según el día de la semana
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
    const [o, p, a] = await Promise.all([
      services.project.getObras(),
      services.personal.getPersonal(),
      services.asig.getAsignaciones()
    ]);
    setObras(o);
    setPersonalDisponible(p);
    setAsignaciones(a);
    setLoading(false);
  };

  React.useEffect(() => { cargarDatos(); }, []);

  // Función 2: Guardado con fecha correcta
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
    await cargarDatos(); // Recargar para ver cambios
  };

  // Función 3: Borrado de asignación
const eliminarAsignacion = async () => {
  if (!selectedAsig || !selectedAsig.asig.Id) {
    console.error("No hay ID de asignación para eliminar");
    return;
  }

  try {
    setLoading(true); // Mostrar spinner mientras borra
    
    // 1. Llamada al servicio
    await services.asig.eliminarAsignacion(selectedAsig.asig.Id);
    
    // 2. Cerramos el diálogo inmediatamente
    setSelectedAsig(null);
    
    // 3. Recargamos los datos de SharePoint para actualizar la tabla
    await cargarDatos();
    
    console.log("Asignación eliminada correctamente");
  } catch (error) {
    console.error("Error al eliminar la asignación:", error);
    alert("No se pudo eliminar la asignación. Revisa la consola.");
  } finally {
    setLoading(false);
  }
};

  if (loading) return <Spinner label="Actualizando cuadrante..." size={SpinnerSize.large} />;

  return (
    <Stack tokens={{ childrenGap: 20 }} className={styles.vistaPlanificacion}>
      <Text variant="xxLarge">Planificación Semanal Real</Text>
      
      <Stack horizontal tokens={{ childrenGap: 20 }}>
        {/* Panel lateral */}
        <div className={styles.personalPanel}>
          <Text variant="large">Personal</Text>
          {personalDisponible.map(p => (
            <div key={p.Id} draggable onDragStart={(e) => e.dataTransfer.setData("personId", p.Id.toString())} className={styles.draggablePersona}>
              <Persona text={p.NombreyApellido} imageUrl={p.FotoPerfil} size={PersonaSize.size32} />
            </div>
          ))}
        </div>

        {/* Tabla */}
        <table className={styles.planTable}>
          <thead>
            <tr>
              <th>Obra</th>
              {DIAS_SEMANA.map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {obras.map(obra => (
              <tr key={obra.Id}>
                <td className={styles.cellObra}>{obra.Title}</td>
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
      </Stack>

      {/* DIÁLOGO DE EDICIÓN / BORRADO */}
      <Dialog
        hidden={!selectedAsig}
        onDismiss={() => setSelectedAsig(null)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Gestionar Asignación',
          subText: `¿Qué deseas hacer con la asignación de ${selectedAsig?.persona.NombreyApellido}?`
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={eliminarAsignacion} text="Eliminar de este día" color="red" />
          <DefaultButton onClick={() => setSelectedAsig(null)} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};