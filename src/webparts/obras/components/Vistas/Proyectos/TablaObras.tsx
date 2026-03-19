import * as React from "react";
import {
  Stack,
  Text,
  PrimaryButton,
  Panel,
  TextField,
  DatePicker,
  Dropdown,
  IDropdownOption,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Separator,
  Facepile,
  IFacepilePersona,
  ProgressIndicator,
  PersonaSize,
  Icon,
  DocumentCard,
  Image,
  ImageFit,
  PanelType
} from "@fluentui/react";
import { SPHttpClient } from "@microsoft/sp-http";
import { ProjectService } from "../../../service/ProjectService";
import { IObra } from "../../../models/IObra";

import styles from "./TablaObras.module.scss";

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

  const [obraSeleccionada, setObraSeleccionada] = React.useState<IObraCard | null>(null);
  const [fotosObra, setFotosObra] = React.useState<any[]>([]);
  const [loadingFotos, setLoadingFotos] = React.useState(false);

  const [nuevaObra, setNuevaObra] = React.useState({
    Nombre: "",
    Descripcion: "",
    ClienteId: 0,
    Direccion: "",
    FechaInicio: new Date(),
    FechaFin: new Date(),
  });

  const projectService = React.useMemo(
    () => new ProjectService(props.context),
    [props.context]
  );

  const verDetallesObra = async (obra: IObraCard) => {
    setObraSeleccionada(obra);
    setLoadingFotos(true);
    try {
      const fotos = await projectService.getFotosPorObra(obra.Id);
      setFotosObra(fotos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFotos(false);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [listaObras, respClientes, listaAsignaciones] = await Promise.all([
        projectService.getObras(),
        props.context.spHttpClient.get(
          `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Clientes')/items?$select=Id,Title`,
          SPHttpClient.configurations.v1
        ),
        projectService.getAsignacionesConPersonal(),
      ]);

      let opcionesClientes: IDropdownOption[] = [];
      if (respClientes.ok) {
        const dataC = await respClientes.json();
        opcionesClientes = (dataC.value || []).map((c: any) => ({
          key: c.Id,
          text: c.Title,
        }));
        setClientes(opcionesClientes);
      }

      const hoy = new Date().getTime();

      const obrasProcesadas: IObraCard[] = listaObras.map((o: IObra) => {
        const inicio = o.FechaInicio ? new Date(o.FechaInicio).getTime() : hoy;
        const fin = o.FechaFinPrevista ? new Date(o.FechaFinPrevista).getTime() : hoy;

        const total = fin - inicio;
        const transcurrido = hoy - inicio;
        const porcentaje = total > 0 ? Math.min(Math.max(transcurrido / total, 0), 1) : 0;

        const operariosAsignados: IFacepilePersona[] = listaAsignaciones
          .filter((a: any) => Number(a.ObraId) === Number(o.Id))
          .map((a: any) => ({
            personaName: a.Personal?.NombreyApellido || "Operario",
            imageUrl: a.Personal?.FotoPerfil || "",
          }));

        return {
          ...o,
          clienteNombre: opcionesClientes.find((c) => Number(c.key) === (o as any).ClienteId)?.text || "Cliente no definido",
          porcentajeTiempo: porcentaje,
          operarios: operariosAsignados,
          diasRestantes: Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24)),
        };
      });

      setObras(obrasProcesadas);
    } catch (e) {
      console.error("Error al cargar Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    try {
      setSaving(true);
      await projectService.crearObra(nuevaObra);
      setIsOpen(false);
      setNuevaObra({
        Nombre: "",
        Descripcion: "",
        ClienteId: 0,
        Direccion: "",
        FechaInicio: new Date(),
        FechaFin: new Date(),
      });
      await cargarDatos();
    } catch (e) {
      alert("Error al guardar obra.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size={SpinnerSize.large} label="Sincronizando Proyectos EWS..." />;

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <Stack>
          <Text variant="xxLarge" className={styles.tituloPrincipal}>Panel de Control de Obras</Text>
          <Text variant="small" className={styles.subtituloHeader}>Gestión de energías renovables y sostenibilidad</Text>
        </Stack>
        <PrimaryButton
          iconProps={{ iconName: "Add" }}
          text="Nueva Obra"
          onClick={() => setIsOpen(true)}
          className={styles.btnNuevaObra}
        />
      </div>

      <div className={styles.gridObras}>
        {obras.length > 0 ? (
          obras.map((o) => (
            <DocumentCard
              key={o.Id}
              className={styles.cardObra}
              onClick={() => verDetallesObra(o)}
            >
              <div className={styles.cardContent}>
                <Stack tokens={{ childrenGap: 12 }}>
                  <Stack horizontal horizontalAlign="space-between" verticalAlign="start">
                    <Stack className={styles.cardTitleArea}>
                      <Text className={styles.obraTitle}>{o.Title}</Text>
                      <Text className={styles.clienteText}>{o.clienteNombre}</Text>
                    </Stack>
                    <div className={`${styles.badgeEstado} ${o.EstadoObra === "Finalizado" ? styles.finalizado : styles.activo}`}>
                      {o.EstadoObra || "Activo"}
                    </div>
                  </Stack>

                  <Separator />

                  <Stack>
                    <Text className={styles.labelSeccion}>Equipo en Campo:</Text>
                    <Facepile personas={o.operarios} personaSize={PersonaSize.size32} />
                  </Stack>

                  <Stack tokens={{ childrenGap: 4 }}>
                    <div className={styles.infoRow}>
                      <Icon iconName="MapPin" />
                      <Text variant="small" nowrap>{o.DireccionObra || "Sin dirección"}</Text>
                    </div>
                    <div className={styles.infoRow}>
                      <Icon iconName="Calendar" />
                      <Text variant="small">Días restantes: <b>{o.diasRestantes > 0 ? o.diasRestantes : 0}</b></Text>
                    </div>
                  </Stack>

                  <ProgressIndicator
                    percentComplete={o.porcentajeTiempo}
                    label="Progreso Temporal"
                    className={o.porcentajeTiempo > 0.9 && o.EstadoObra !== "Finalizado" ? styles.progresoCritico : styles.progresoNormal}
                  />
                </Stack>
              </div>
            </DocumentCard>
          ))
        ) : (
          <MessageBar messageBarType={MessageBarType.info}>No hay proyectos registrados.</MessageBar>
        )}
      </div>

      <Panel 
        isOpen={isOpen} 
        onDismiss={() => setIsOpen(false)} 
        headerText="Configurar Nuevo Proyecto"
        type={PanelType.medium}
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField label="Nombre del Proyecto" required value={nuevaObra.Nombre} onChange={(_, v) => setNuevaObra({ ...nuevaObra, Nombre: v || "" })} />
          <Dropdown label="Cliente" required options={clientes} selectedKey={nuevaObra.ClienteId} onChange={(_, opt) => setNuevaObra({ ...nuevaObra, ClienteId: opt?.key as number })} />
          <TextField label="Dirección de Obra" value={nuevaObra.Direccion} onChange={(_, v) => setNuevaObra({ ...nuevaObra, Direccion: v || "" })} />
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <DatePicker label="Fecha Inicio" value={nuevaObra.FechaInicio} onSelectDate={(d) => setNuevaObra({ ...nuevaObra, FechaInicio: d || new Date() })} />
            <DatePicker label="Plazo Estimado" value={nuevaObra.FechaFin} onSelectDate={(d) => setNuevaObra({ ...nuevaObra, FechaFin: d || new Date() })} />
          </Stack>
          <PrimaryButton 
            text="Lanzar Proyecto" 
            onClick={handleGuardar} 
            disabled={saving || !nuevaObra.Nombre || !nuevaObra.ClienteId}
            className={styles.btnLaunch}
          />
        </Stack>
      </Panel>

      <Panel
        isOpen={!!obraSeleccionada}
        onDismiss={() => { setObraSeleccionada(null); setFotosObra([]); }}
        headerText={`EWS Insight: ${obraSeleccionada?.Title}`}
        type={PanelType.medium}
      >
        <div className={styles.panelDetallesContainer}>
          {loadingFotos ? (
            <Spinner size={SpinnerSize.large} label="Cargando evidencias de campo..." />
          ) : fotosObra.length > 0 ? (
            <Stack tokens={{ childrenGap: 25 }}>
              {fotosObra.map((f, i) => (
                <div key={i} className={styles.fotoCard}>
                  <Stack tokens={{ childrenGap: 12 }}>
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                      <Text className={styles.fotoFecha}>📅 {new Date(f.FechaRegistro).toLocaleDateString()}</Text>
                      <Text className={styles.fotoOperario}>👷 {f.Operario}</Text>
                    </Stack>
                    <Image
                      src={f.UrlFoto?.Url}
                      alt="Evidencia"
                      width="100%"
                      height={280}
                      imageFit={ImageFit.cover}
                      className={styles.fotoImagen}
                    />
                    <div className={styles.fotoComentarioBox}>
                      <Text className={styles.fotoComentarioText}>
                        "{f.Comentarios || 'Sin observaciones técnicas'}"
                      </Text>
                    </div>
                  </Stack>
                </div>
              ))}
            </Stack>
          ) : (
            <MessageBar messageBarType={MessageBarType.info}>Sin reportes fotográficos disponibles.</MessageBar>
          )}
        </div>
      </Panel>
    </div>
  );
};