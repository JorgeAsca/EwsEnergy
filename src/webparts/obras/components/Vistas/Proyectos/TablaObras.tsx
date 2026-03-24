import * as React from "react";
import {
  Stack,
  Text,
  PrimaryButton,
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
  PersonaSize,
  Icon,
  Image,
  ImageFit,
  Modal,
  IconButton,
  DefaultButton,
} from "@fluentui/react";
import { SPHttpClient } from "@microsoft/sp-http";
import { ProjectService } from "../../../service/ProjectService";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { IObra } from "../../../models/IObra";
import styles from "./TablaObras.module.scss";

interface IObraCard extends IObra {
  clienteNombre: string;
  porcentajeReal: number;
  operarios: IFacepilePersona[];
  jornadasConsumidas: number;
}

export const TablaObras: React.FC<{ context: any }> = (props) => {
  const [obras, setObras] = React.useState<IObraCard[]>([]);
  const [clientes, setClientes] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [obraEditandoId, setObraEditandoId] = React.useState<number | null>(
    null,
  );
  const [obraSeleccionada, setObraSeleccionada] =
    React.useState<IObraCard | null>(null);
  const [fotosObra, setFotosObra] = React.useState<any[]>([]);
  const [loadingFotos, setLoadingFotos] = React.useState(false);

  const [nuevaObra, setNuevaObra] = React.useState({
    Nombre: "",
    Descripcion: "",
    ClienteId: 0,
    Direccion: "",
    FechaInicio: new Date(),
    FechaFin: new Date(),
    JornadasTotales: 30, // Nuevo campo
  });

  const projectService = React.useMemo(
    () => new ProjectService(props.context),
    [props.context],
  );
  const personalService = React.useMemo(
    () => new PersonalService(props.context),
    [props.context],
  );
  const asigService = React.useMemo(
    () => new AsignacionesService(props.context),
    [props.context],
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [listaObras, respClientes, listaAsignaciones, listaPersonal] =
        await Promise.all([
          projectService.getObras(),
          props.context.spHttpClient.get(
            `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Clientes')/items?$select=Id,Title`,
            SPHttpClient.configurations.v1,
          ),
          asigService.getAsignaciones(),
          personalService.getPersonal(),
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

      const obrasProcesadas: IObraCard[] = listaObras.map((o: IObra) => {
        const porcentajeReal = (o.ProgresoReal || 0) / 100;

        // Jornadas
        const totalJornadas = o.JornadasTotales || 30;
        const consumidas = porcentajeReal * totalJornadas;

        const asigsObra = (listaAsignaciones as any[]).filter(
          (a) => Number(a.ObraId) === Number(o.Id),
        );
        const uniquePersonalIds = Array.from(
          new Set(asigsObra.map((a) => Number(a.PersonalId))),
        );

        const operariosAsignados: IFacepilePersona[] = uniquePersonalIds.map(
          (pid) => {
            const pers = (listaPersonal as any[]).find(
              (p) => Number(p.Id) === pid,
            );
            return {
              personaName: pers?.NombreyApellido || "Operario",
              imageUrl: pers?.FotoPerfil || "",
            };
          },
        );

        return {
          ...o,
          clienteNombre:
            opcionesClientes.find(
              (c) => Number(c.key) === (o as any).Cliente?.Id,
            )?.text || "Cliente no definido",
          porcentajeReal: Math.min(Math.max(porcentajeReal, 0), 1),
          operarios: operariosAsignados,
          jornadasConsumidas: parseFloat(consumidas.toFixed(1)),
        };
      });

      setObras(obrasProcesadas);
      if (obraSeleccionada) {
        const actualizada = obrasProcesadas.find(
          (o) => o.Id === obraSeleccionada.Id,
        );
        if (actualizada) setObraSeleccionada(actualizada);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  const verDetallesObra = async (obra: IObraCard) => {
    setObraSeleccionada(obra);
    setLoadingFotos(true);
    try {
      const fotos = await projectService.getFotosPorObra(obra.Id as number);
      setFotosObra(fotos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFotos(false);
    }
  };

  const abrirEdicion = () => {
    if (!obraSeleccionada) return;
    const clId =
      (clientes.find((c) => c.text === obraSeleccionada.clienteNombre)
        ?.key as number) || 0;

    setNuevaObra({
      Nombre: obraSeleccionada.Title,
      Descripcion: obraSeleccionada.Descripcion || "",
      ClienteId: clId,
      Direccion: obraSeleccionada.DireccionObra || "",
      FechaInicio: obraSeleccionada.FechaInicio
        ? new Date(obraSeleccionada.FechaInicio)
        : new Date(),
      FechaFin: obraSeleccionada.FechaFinPrevista
        ? new Date(obraSeleccionada.FechaFinPrevista)
        : new Date(),
      JornadasTotales: obraSeleccionada.JornadasTotales || 30,
    });
    setObraEditandoId(obraSeleccionada.Id as number);
    setIsOpen(true);
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      if (obraEditandoId) {
        await projectService.updateObra(obraEditandoId, nuevaObra);
      } else {
        await projectService.crearObra(nuevaObra);
      }
      setIsOpen(false);
      setObraEditandoId(null);
      setNuevaObra({
        Nombre: "",
        Descripcion: "",
        ClienteId: 0,
        Direccion: "",
        FechaInicio: new Date(),
        FechaFin: new Date(),
        JornadasTotales: 30,
      });
      await cargarDatos();
    } catch (e) {
      alert("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const obrasAgrupadas = obras.reduce(
    (acc, obra) => {
      const estado = obra.EstadoObra || "Sin Asignar";
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(obra);
      return acc;
    },
    {} as Record<string, IObraCard[]>,
  );

  const renderProgressTracker = (pReal: number) => {
    const totalBoxes = 10;
    const filledBoxes = Math.round(pReal * totalBoxes);

    return (
      <div
        className={styles.progressTrackerBox}
        title={`Avance de Jornadas: ${(pReal * 100).toFixed(0)}%`}
      >
        {Array.from({ length: totalBoxes }).map((_, idx) => (
          <div
            key={idx}
            className={`${styles.trackerDot} ${idx < filledBoxes ? styles.filledOnTrack : ""}`}
          />
        ))}
      </div>
    );
  };

  if (loading && obras.length === 0)
    return (
      <Spinner
        size={SpinnerSize.large}
        label="Sincronizando Proyectos EWS..."
      />
    );

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <Stack>
          <Text variant="xxLarge" className={styles.tituloPrincipal}>
            Panel de Control de Obras
          </Text>
          <Text variant="small" className={styles.subtituloHeader}>
            Gestión y seguimiento de proyectos EWS Energy
          </Text>
        </Stack>
        <PrimaryButton
          iconProps={{ iconName: "Add" }}
          text="Nueva Obra"
          onClick={() => {
            setObraEditandoId(null);
            setIsOpen(true);
          }}
          className={styles.btnNuevaObra}
        />
      </div>

      <div className={styles.splitLayout}>
        <div className={styles.listColumn}>
          <div className={styles.listContainer}>
            {Object.keys(obrasAgrupadas).length === 0 && (
              <MessageBar>No hay proyectos registrados.</MessageBar>
            )}
            {Object.keys(obrasAgrupadas).map((estado) => (
              <div key={estado}>
                <Text className={styles.listGroupHeader}>{estado}</Text>
                {obrasAgrupadas[estado].map((o) => (
                  <div
                    key={o.Id}
                    className={`${styles.listItem} ${obraSeleccionada?.Id === o.Id ? styles.selected : ""}`}
                    onClick={() => verDetallesObra(o)}
                  >
                    <Text className={styles.obraTitle}>{o.Title}</Text>
                    {renderProgressTracker(o.porcentajeReal)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.detailColumn}>
          {obraSeleccionada ? (
            <div className={styles.detailContent}>
              <Stack
                horizontal
                horizontalAlign="space-between"
                verticalAlign="center"
              >
                <Stack>
                  <Text variant="xLarge" className={styles.detailTitle}>
                    {obraSeleccionada.Title}
                  </Text>
                  <Text variant="small" style={{ color: "#666" }}>
                    {obraSeleccionada.clienteNombre}
                  </Text>
                </Stack>
                <div
                  className={`${styles.badgeEstado} ${obraSeleccionada.EstadoObra === "Finalizado" ? styles.finalizado : styles.activo}`}
                >
                  {obraSeleccionada.EstadoObra || "Fase Previa"}
                </div>
                <DefaultButton
                  iconProps={{ iconName: "Edit" }}
                  text="Editar"
                  onClick={abrirEdicion}
                />
              </Stack>
              <Separator />

              <Stack
                horizontal
                tokens={{ childrenGap: 40 }}
                className={styles.infoSection}
              >
                <Stack>
                  <Text className={styles.labelSeccion}>Dirección</Text>
                  <Text>
                    <Icon iconName="MapPin" className={styles.iconVerde} />{" "}
                    {obraSeleccionada.DireccionObra || "Sin dirección"}
                  </Text>
                </Stack>
                <Stack>
                  <Text className={styles.labelSeccion}>
                    Jornadas Consumidas
                  </Text>
                  <Text>
                    <Icon iconName="Calendar" className={styles.iconVerde} />{" "}
                    {obraSeleccionada.jornadasConsumidas} /{" "}
                    {obraSeleccionada.JornadasTotales || 30}
                  </Text>
                </Stack>
                <Stack>
                  <Text className={styles.labelSeccion}>Avance Físico</Text>
                  <Text>
                    <Icon
                      iconName="CompletedSolid"
                      className={styles.iconVerde}
                    />{" "}
                    {(obraSeleccionada.porcentajeReal * 100).toFixed(0)}%
                    Ejecutado
                  </Text>
                </Stack>
                <Stack>
                  <Text className={styles.labelSeccion}>Equipo en Campo</Text>
                  {obraSeleccionada.operarios &&
                  obraSeleccionada.operarios.length > 0 ? (
                    <Facepile
                      personas={obraSeleccionada.operarios}
                      personaSize={PersonaSize.size32}
                    />
                  ) : (
                    <Text
                      variant="small"
                      style={{ color: "#888", fontStyle: "italic" }}
                    >
                      Sin personal asignado
                    </Text>
                  )}
                </Stack>
              </Stack>

              <div className={styles.planosSection}>
                <Stack
                  horizontal
                  horizontalAlign="space-between"
                  verticalAlign="center"
                  styles={{ root: { marginBottom: 15 } }}
                >
                  <Text variant="large" className={styles.sectionTitle}>
                    Planos y Documentación
                  </Text>
                  <DefaultButton
                    iconProps={{ iconName: "Upload" }}
                    className={styles.btnUpload}
                  >
                    Añadir Archivo
                  </DefaultButton>
                </Stack>
                <Stack horizontal tokens={{ childrenGap: 15 }} wrap>
                  <div className={styles.planoCard}>
                    <Icon iconName="PDFSolid" className={styles.pdfIcon} />
                    <Text variant="smallPlus">Esquema_Eléctrico_v2.pdf</Text>
                  </div>
                  <div className={styles.planoCard}>
                    <Icon iconName="VisioDocument" className={styles.dwgIcon} />
                    <Text variant="smallPlus">Topografía_Terreno.dwg</Text>
                  </div>
                </Stack>
              </div>

              <div className={styles.historialSection}>
                <Text variant="large" className={styles.sectionTitle}>
                  Reportes de Jornada
                </Text>
                {loadingFotos ? (
                  <Spinner
                    size={SpinnerSize.large}
                    label="Cargando reportes..."
                  />
                ) : fotosObra.length > 0 ? (
                  <Stack
                    tokens={{ childrenGap: 15 }}
                    styles={{ root: { marginTop: 15 } }}
                  >
                    {fotosObra.map((f, i) => (
                      <div key={i} className={styles.fotoCard}>
                        <Stack horizontal tokens={{ childrenGap: 15 }}>
                          <Image
                            src={f.UrlFoto?.Url}
                            width={120}
                            height={90}
                            imageFit={ImageFit.cover}
                            className={styles.fotoThumb}
                          />
                          <Stack>
                            <Text className={styles.fotoFecha}>
                              📅{" "}
                              {new Date(f.FechaRegistro).toLocaleDateString()} -
                              👷 {f.Operario}
                            </Text>
                            <div className={styles.fotoComentarioBox}>
                              <Text className={styles.fotoComentarioText}>
                                "{f.Comentarios || "Sin observaciones técnicas"}
                                "
                              </Text>
                            </div>
                          </Stack>
                        </Stack>
                      </div>
                    ))}
                  </Stack>
                ) : (
                  <MessageBar messageBarType={MessageBarType.info}>
                    No hay reportes para esta obra.
                  </MessageBar>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Icon iconName="ProjectCollection" className={styles.emptyIcon} />
              <Text variant="xLarge">Selecciona una obra</Text>
              <Text variant="medium">
                Pincha en un proyecto de la lista para ver su información.
              </Text>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        isBlocking={false}
        containerClassName={styles.modalFlotanteContainer}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <Text variant="xLarge" className={styles.modalTitle}>
              {obraEditandoId ? "Editar Proyecto" : "Configurar Nuevo Proyecto"}
            </Text>
            <IconButton
              iconProps={{ iconName: "Cancel" }}
              onClick={() => setIsOpen(false)}
              className={styles.btnClose}
            />
          </div>
          <Separator className={styles.modalSeparator} />
          <div className={styles.modalBody}>
            <Stack tokens={{ childrenGap: 15 }}>
              <TextField
                label="Nombre del Proyecto"
                required
                value={nuevaObra.Nombre}
                onChange={(_, v) =>
                  setNuevaObra({ ...nuevaObra, Nombre: v || "" })
                }
              />
              <Dropdown
                label="Cliente"
                required
                options={clientes}
                selectedKey={nuevaObra.ClienteId}
                onChange={(_, opt) =>
                  setNuevaObra({ ...nuevaObra, ClienteId: opt?.key as number })
                }
              />
              <TextField
                label="Dirección de Obra"
                value={nuevaObra.Direccion}
                onChange={(_, v) =>
                  setNuevaObra({ ...nuevaObra, Direccion: v || "" })
                }
              />
              <Stack horizontal tokens={{ childrenGap: 20 }}>
                {/* CAMPO DE JORNADAS */}
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Jornadas Presupuestadas"
                    type="number"
                    required
                    value={nuevaObra.JornadasTotales.toString()}
                    onChange={(_, v) =>
                      setNuevaObra({
                        ...nuevaObra,
                        JornadasTotales: parseInt(v || "0"),
                      })
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <DatePicker
                    label="Fecha Inicio"
                    value={nuevaObra.FechaInicio}
                    onSelectDate={(d) =>
                      setNuevaObra({
                        ...nuevaObra,
                        FechaInicio: d || new Date(),
                      })
                    }
                  />
                </div>
              </Stack>
            </Stack>
          </div>
          <div className={styles.modalFooter}>
            <Stack
              horizontal
              tokens={{ childrenGap: 10 }}
              horizontalAlign="end"
            >
              {saving ? (
                <Spinner label="Guardando..." />
              ) : (
                <>
                  <PrimaryButton
                    text={obraEditandoId ? "Actualizar" : "Lanzar Proyecto"}
                    onClick={handleGuardar}
                    className={styles.btnLaunch}
                    disabled={!nuevaObra.Nombre || !nuevaObra.ClienteId}
                  />
                  <DefaultButton
                    text="Cancelar"
                    onClick={() => setIsOpen(false)}
                  />
                </>
              )}
            </Stack>
          </div>
        </div>
      </Modal>
    </div>
  );
};
