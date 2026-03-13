import * as React from "react";
import {
  Stack,
  Text,
  Persona,
  PersonaSize,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  DefaultButton,
  Panel,
  TextField,
  Dropdown,
  IDropdownOption,
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [nuevo, setNuevo] = React.useState({
    NombreyApellido: "",
    Rol: "Operario",
  });

  const service = React.useMemo(
    () => new PersonalService(props.context),
    [props.context],
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // El servicio ahora retorna Title mapeado como NombreyApellido
      const data = await service.getPersonal();
      setEmpleados(data || []);
    } catch (err) {
      console.error("Error cargando personal:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos().catch(console.error);
  }, []);

  const handleGuardar = async () => {
    if (!nuevo.NombreyApellido.trim()) return;
    try {
      setSaving(true);
      // El servicio se encargará de enviar esto a la columna 'Title'
      await service.crearTrabajador(nuevo);
      setIsOpen(false);
      setNuevo({ NombreyApellido: "", Rol: "Operario" });
      await cargarDatos();
    } catch (e) {
      console.error("Error al guardar:", e);
      alert(
        "Error al guardar en SharePoint. Verifica la conexión y los permisos de la lista.",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption,
  ): void => {
    if (option) {
      setNuevo({ ...nuevo, Rol: option.key as string });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
          👥 Equipo EWS Energy
        </Text>
        <PrimaryButton
          text="Nuevo Personal"
          iconProps={{ iconName: "AddFriend" }}
          onClick={() => setIsOpen(true)}
        />
      </Stack>

      <div style={{ marginTop: "30px" }}>
        {loading ? (
          <Spinner size={SpinnerSize.large} label="Cargando equipo..." />
        ) : (
          <Stack horizontal wrap tokens={{ childrenGap: 30 }}>
            {empleados.length > 0 ? (
              empleados.map((emp) => (
                <Persona
                  key={emp.Id}
                  // emp.NombreyApellido contiene ahora el valor de la columna 'Title' (El valor verdadero del nombre del empleado)
                  text={emp.NombreyApellido || "Sin nombre"}
                  secondaryText={emp.Rol || "EWS Energy"}
                  size={PersonaSize.size100}
                />
              ))
            ) : (
              <MessageBar messageBarType={MessageBarType.info}>
                No se encontraron datos. Asegúrate de que los registros en
                SharePoint tengan el campo 'Título' (Title) completado.
              </MessageBar>
            )}
          </Stack>
        )}
      </div>

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Dar de alta nuevo empleado"
        closeButtonAriaLabel="Cerrar"
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField
            label="Nombre y Apellido (Campo Título)"
            required
            placeholder="Escribe el nombre completo..."
            value={nuevo.NombreyApellido}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, NombreyApellido: v || "" })
            }
          />

          <Dropdown
            label="Rol / Cargo"
            selectedKey={nuevo.Rol}
            options={[
              { key: "Operario", text: "Operario" },
              { key: "Jefe de Obra", text: "Jefe de Obra" },
              { key: "Administración", text: "Administración" },
              { key: "Manager", text: "Manager" },
            ]}
            onChange={onDropdownChange}
          />

          <Stack
            horizontal
            tokens={{ childrenGap: 10 }}
            style={{ marginTop: 30 }}
          >
            {saving ? (
              <Spinner label="Guardando..." />
            ) : (
              <React.Fragment>
                <PrimaryButton
                  text="Guardar"
                  onClick={handleGuardar}
                  disabled={!nuevo.NombreyApellido.trim()}
                />
                <DefaultButton
                  text="Cancelar"
                  onClick={() => setIsOpen(false)}
                />
              </React.Fragment>
            )}
          </Stack>
        </Stack>
      </Panel>
    </div>
  );
};
