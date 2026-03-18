import * as React from "react";
import {
  Stack, Text, PrimaryButton, Panel, TextField, DatePicker, Dropdown,
  IDropdownOption, Spinner, SpinnerSize, DefaultButton, MessageBar,
  MessageBarType, Separator, Facepile, IFacepilePersona, ProgressIndicator,
  PersonaSize, Icon, DocumentCard
} from "@fluentui/react";
import { SPHttpClient } from "@microsoft/sp-http";
import { ProjectService } from "../../../service/ProjectService";
import { IObra } from "../../../models/IObra";

import styles from "./TablaObras.module.scss";

// Interfaz extendida para el Dashboard
interface IObraCard extends IObra {
  clienteNombre: string;
  porcentajeTiempo: number;
  operarios: IFacepilePersona[];
  diasRestantes: number;
}

export const TablaObras: React.FC<{ context: any }> = (props) => {
  const [obras, setObras] = React.useState<IObraCard[]>([]);
  const [clientes, setClientes] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [nuevaObra, setNuevaObra] = React.useState({
    Nombre: "",
    Descripcion: "",
    ClienteId: 0,
    Direccion: "",
    FechaInicio: new Date(),
    FechaFin: new Date(),
  });

  const projectService = React.useMemo(() => new ProjectService(props.context), [props.context]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [listaObras, respClientes, listaAsignaciones] = await Promise.all([
        projectService.getObras(),
        props.context.spHttpClient.get(`${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Clientes')/items?$select=Id,Title`, SPHttpClient.configurations.v1),
        projectService.getAsignacionesConPersonal()
      ]);

      let opcionesClientes: IDropdownOption[] = [];
      if (respClientes.ok) {
        const dataC = await respClientes.json();
        opcionesClientes = (dataC.value || []).map((c: any) => ({ key: c.Id, text: c.Title }));
        setClientes(opcionesClientes);
      }

      const hoy = new Date().getTime();
      
      const obrasProcesadas: IObraCard[] = listaObras.map((o: IObra) => {
        // Manejo seguro de fechas desde ISO String
        const inicio = o.FechaInicio ? new Date(o.FechaInicio).getTime() : hoy;
        const fin = o.FechaFinPrevista ? new Date(o.FechaFinPrevista).getTime() : hoy;
        
        const total = fin - inicio;
        const transcurrido = hoy - inicio;
        
        // Evitamos división por cero y aseguramos rango 0 a 1 para el ProgressIndicator
        const porcentaje = total > 0 ? Math.min(Math.max(transcurrido / total, 0), 1) : 0;

        const operariosAsignados: IFacepilePersona[] = listaAsignaciones
          .filter((a: any) => Number(a.ObraId) === Number(o.Id))
          .map((a: any) => ({
            personaName: a.Personal?.NombreyApellido || "Operario",
            imageUrl: a.Personal?.FotoPerfil || ""
          }));

        return {
          ...o,
          clienteNombre: opcionesClientes.find(c => Number(c.key) === (o as any).ClienteId)?.text || "Cliente no definido",
          porcentajeTiempo: porcentaje,
          operarios: operariosAsignados,
          diasRestantes: Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24))
        };
      });

      setObras(obrasProcesadas);
    } catch (e) {
      console.error("Error al cargar Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { cargarDatos(); }, []);

  const handleGuardar = async () => {
    try {
      setSaving(true);
      await projectService.crearObra(nuevaObra);
      setIsOpen(false);
      setNuevaObra({ Nombre: "", Descripcion: "", ClienteId: 0, Direccion: "", FechaInicio: new Date(), FechaFin: new Date() });
      await cargarDatos();
    } catch (e) { alert("Error al guardar obra."); } 
    finally { setSaving(false); }
  };

  if (loading) return <Spinner size={SpinnerSize.large} label="Sincronizando Proyectos EWS..." />;

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <Stack>
          <Text variant="xxLarge" className={styles.tituloPrincipal}>Panel de Control de Obras</Text>
          <Text variant="small">Seguimiento de tiempos y personal asignado</Text>
        </Stack>
        <PrimaryButton iconProps={{ iconName: "Add" }} text="Nueva Obra" onClick={() => setIsOpen(true)} />
      </div>

      <div className={styles.gridObras}>
        {obras.length > 0 ? obras.map((o) => (
          <DocumentCard key={o.Id} className={styles.cardObra}>
            <div className={styles.cardContent}>
              <Stack tokens={{ childrenGap: 12 }}>
                <Stack horizontal horizontalAlign="space-between">
                  <Stack style={{ maxWidth: '70%' }}>
                    <Text variant="large" style={{ fontWeight: 600, color: '#004a99' }}>{o.Title}</Text>
                    <Text variant="small" style={{ color: '#666' }}>{o.clienteNombre}</Text>
                  </Stack>
                  <div className={styles.badgeEstado} style={{ 
                    background: o.EstadoObra === 'Finalizado' ? '#dff6dd' : '#deecf9',
                    color: o.EstadoObra === 'Finalizado' ? '#107c10' : '#0078d4'
                  }}>
                    {o.EstadoObra}
                  </div>
                </Stack>

                <Separator />

                <Stack>
                  <Text variant="small" style={{ fontWeight: 600, marginBottom: 8 }}>Personal en obra:</Text>
                  <Facepile personas={o.operarios} personaSize={PersonaSize.size32} />
                </Stack>

                <div className={styles.infoRow}>
                  <Icon iconName="MapPin" />
                  <Text variant="small" nowrap>{o.DireccionObra || 'Sin dirección'}</Text>
                </div>

                {/* Línea 135 corregida con el tipo IObraCard */}
                <ProgressIndicator 
                  percentComplete={o.porcentajeTiempo} 
                  label="Tiempo transcurrido"
                  description={o.diasRestantes > 0 ? `${o.diasRestantes} días restantes` : 'Plazo finalizado'}
                  styles={{ itemProgress: { 
                    // Toque profesional: Si falta menos del 10% de tiempo, la barra se vuelve naranja
                    backgroundColor: o.porcentajeTiempo > 0.9 && o.EstadoObra !== 'Finalizado' ? '#ffaa44' : undefined 
                  }}}
                />
              </Stack>
            </div>
          </DocumentCard>
        )) : (
          <MessageBar>No hay proyectos activos registrados.</MessageBar>
        )}
      </div>

      {/* Tu Panel Oscuro sigue igual */}
      <Panel isOpen={isOpen} onDismiss={() => setIsOpen(false)} headerText="Nuevo Proyecto">
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField label="Nombre" required value={nuevaObra.Nombre} onChange={(_, v) => setNuevaObra({ ...nuevaObra, Nombre: v || "" })} />
          <Dropdown label="Cliente" required options={clientes} selectedKey={nuevaObra.ClienteId} onChange={(_, opt) => setNuevaObra({ ...nuevaObra, ClienteId: opt?.key as number })} />
          <TextField label="Dirección" value={nuevaObra.Direccion} onChange={(_, v) => setNuevaObra({ ...nuevaObra, Direccion: v || "" })} />
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <DatePicker label="Inicio" value={nuevaObra.FechaInicio} onSelectDate={(d) => setNuevaObra({ ...nuevaObra, FechaInicio: d || new Date() })} />
            <DatePicker label="Fin" value={nuevaObra.FechaFin} onSelectDate={(d) => setNuevaObra({ ...nuevaObra, FechaFin: d || new Date() })} />
          </Stack>
          <PrimaryButton text="Crear Proyecto" onClick={handleGuardar} disabled={saving || !nuevaObra.Nombre || !nuevaObra.ClienteId} />
        </Stack>
      </Panel>
    </div>
  );
};