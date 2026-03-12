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
  DefaultButton,
  MessageBar,
  MessageBarType,
  Separator,
} from "@fluentui/react";
import { SPHttpClient } from "@microsoft/sp-http";
import { ProjectService } from "../../../service/ProjectService";
import { IObra } from "../../../models/IObra";

// Solución al error de styles: Usamos require para evitar problemas de definición de tipos
const styles: any = require("./TablaObras.module.scss");

export const TablaObras: React.FC<{ context: any }> = (props) => {
  const [obras, setObras] = React.useState<IObra[]>([]);
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

  const projectService = React.useMemo(
    () => new ProjectService(props.context),
    [props.context]
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const listaObras = await projectService.getObras();
      setObras(listaObras || []);

      const resp = await props.context.spHttpClient.get(
        `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Clientes')/items?$select=Id,Title`,
        SPHttpClient.configurations.v1
      );

      if (resp.ok) {
        const data = await resp.json();
        const opciones = (data.value || []).map((c: any) => ({
          key: c.Id,
          text: c.Title,
        }));
        setClientes(opciones);
      }
    } catch (e) {
      console.error("Error al cargar:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos().catch(console.error);
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
      console.error("Error al guardar:", e);
      alert("Error al guardar la obra.");
    } finally {
      setSaving(false);
    }
  };

  // --- LÓGICA DE VALIDACIÓN (PASO A) ---
  const fechaInvalida = nuevaObra.FechaFin < nuevaObra.FechaInicio;
  const formularioIncompleto = nuevaObra.Nombre.trim() === "" || nuevaObra.ClienteId === 0;
  const botonBloqueado = saving || fechaInvalida || formularioIncompleto;

  return (
    <div className={styles.container} style={{ padding: '20px' }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge" style={{ fontWeight: 600, color: "#004a99" }}>
          Proyectos en Curso
        </Text>
        <PrimaryButton
          iconProps={{ iconName: "Add" }}
          text="Nueva Obra"
          onClick={() => setIsOpen(true)}
        />
      </Stack>

      {loading ? (
        <Spinner size={SpinnerSize.large} label="Cargando datos de EWS..." style={{ marginTop: 40 }} />
      ) : (
        /* --- DISEÑO DE TARJETAS (PASO B) --- */
        <div style={{ 
            marginTop: '25px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '20px' 
        }}>
          {obras.length > 0 ? (
            obras.map((o) => {
              const clienteAsociado = clientes.find(c => c.key === (o as any).ClienteId);
              return (
                <div key={o.Id} style={{ 
                    padding: '20px', 
                    border: '1px solid #edebe9', 
                    borderRadius: '8px', 
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Stack tokens={{ childrenGap: 10 }}>
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="start">
                      <Text variant="large" style={{ fontWeight: 600, color: '#004a99', maxWidth: '80%' }}>
                        {o.Title}
                      </Text>
                      <div style={{ 
                        padding: '2px 8px', borderRadius: '12px', background: '#dff6dd', 
                        color: '#107c10', fontSize: '11px', fontWeight: 600 
                      }}>
                        {(o as any).EstadoObra || 'Activo'}
                      </div>
                    </Stack>

                    <Separator styles={{ root: { height: 1 } }} />

                    <Stack tokens={{ childrenGap: 8 }}>
                      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
                        <span style={{ fontSize: '16px' }}>🏢</span>
                        <Text variant="small"><b>Cliente:</b> {clienteAsociado?.text || 'No asignado'}</Text>
                      </Stack>
                      
                      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
                        <span style={{ fontSize: '16px' }}>📍</span>
                        <Text variant="small"><b>Dirección:</b> {(o as any).DireccionObra || (o as any).Direccion || 'Sin dirección'}</Text>
                      </Stack>

                      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
                        <span style={{ fontSize: '16px' }}>📅</span>
                        <Text variant="small">
                          {new Date(o.FechaInicio!).toLocaleDateString()} - {new Date((o as any).FechaFinPrevista || (o as any).FechaFin!).toLocaleDateString()}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </div>
              );
            })
          ) : (
            <MessageBar messageBarType={MessageBarType.info}>
                No hay obras registradas. Use el botón "Nueva Obra" para empezar.
            </MessageBar>
          )}
        </div>
      )}

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Nuevo Proyecto"
        isBlocking={false}
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <Text>Complete los detalles para la nueva obra de EWS Energy</Text>

          <TextField
            label="Nombre del proyecto"
            required
            placeholder="Ej: Reforma oficinas..."
            value={nuevaObra.Nombre}
            onChange={(_, v) => setNuevaObra({ ...nuevaObra, Nombre: v || "" })}
          />

          <TextField
            label="Descripción"
            multiline
            rows={3}
            value={nuevaObra.Descripcion}
            onChange={(_, v) => setNuevaObra({ ...nuevaObra, Descripcion: v || "" })}
          />

          <Dropdown
            label="Cliente"
            placeholder="Seleccionar cliente"
            required
            options={clientes}
            selectedKey={nuevaObra.ClienteId || undefined}
            onChange={(_, opt) => setNuevaObra({ ...nuevaObra, ClienteId: opt?.key as number })}
          />

          <TextField
            label="Dirección de la obra"
            placeholder="Ubicación completa"
            value={nuevaObra.Direccion}
            onChange={(_, v) => setNuevaObra({ ...nuevaObra, Direccion: v || "" })}
          />

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <DatePicker
              label="Fecha inicio"
              value={nuevaObra.FechaInicio}
              onSelectDate={(d) => setNuevaObra({ ...nuevaObra, FechaInicio: d || new Date() })}
            />
            <DatePicker
              label="Fecha fin prevista"
              value={nuevaObra.FechaFin}
              onSelectDate={(d) => setNuevaObra({ ...nuevaObra, FechaFin: d || new Date() })}
            />
          </Stack>

          <Stack tokens={{ childrenGap: 10 }} style={{ marginTop: 30 }}>
            {fechaInvalida && (
              <MessageBar messageBarType={MessageBarType.error}>
                Error: La fecha de fin no puede ser anterior a la de inicio.
              </MessageBar>
            )}

            {saving ? (
              <Spinner label="Guardando..." />
            ) : (
              <>
                <PrimaryButton
                  text="Crear Proyecto"
                  onClick={handleGuardar}
                  disabled={botonBloqueado}
                />
                <DefaultButton text="Cancelar" onClick={() => setIsOpen(false)} />
              </>
            )}
          </Stack>
        </Stack>
      </Panel>
    </div>
  );
};