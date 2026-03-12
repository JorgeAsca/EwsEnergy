// src/webparts/obras/components/Vistas/Personal/GaleriaPersonal.tsx
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
  Dropdown
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
      await service.crearTrabajador(nuevo);
      setIsOpen(false);
      setNuevo({ NombreyApellido: "", Rol: "Operario" });
      await cargarDatos();
    } catch (e) {
      alert("Error al guardar en SharePoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
          👥 Equipo EWS Energy
        </Text>
        {/* Botón siempre visible para evitar el crash de permisos */}
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
                  text={emp.NombreyApellido || "Operario"}
                  secondaryText={emp.Rol || "EWS Energy"}
                  size={PersonaSize.size100}
                />
              ))
            ) : (
              <MessageBar messageBarType={MessageBarType.info}>
                No se encontraron datos en la lista 'Personal EWS'.
              </MessageBar>
            )}
          </Stack>
        )}
      </div>

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Dar de alta Personal"
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField
            label="Nombre y Apellido"
            required
            value={nuevo.NombreyApellido}
            onChange={(_, v) => setNuevo({ ...nuevo, NombreyApellido: v || "" })}
          />

          <Dropdown
            label="Rol / Cargo"
            selectedKey={nuevo.Rol}
            options={[
              { key: "Operario", text: "Operario" },
              { key: "Jefe de Obra", text: "Jefe de Obra" },
              { key: "Administración", text: "Administración" },
            ]}
            onChange={(_, opt) => setNuevo({ ...nuevo, Rol: opt?.key as string })}
          />

          <Stack horizontal tokens={{ childrenGap: 10 }} style={{ marginTop: 30 }}>
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