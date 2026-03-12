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
  IDropdownOption
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

// Solución al error de styles si lo usas
const styles: any = require("./GaleriaPersonal.module.scss");

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Seguridad: Verificación de Admin
  const isAdmin = props.context.pageContext.web.permissions.hasPermission(1024);

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
    cargarDatos();
  }, []);

  const extraerUrlFoto = (foto: any): string => {
    if (!foto) return "";
    try {
      if (foto.serverRelativeUrl) return foto.serverRelativeUrl;
      const parsed = typeof foto === "string" ? JSON.parse(foto) : foto;
      return parsed.serverRelativeUrl || "";
    } catch (e) {
      return "";
    }
  };

  const handleGuardar = async () => {
    if (!nuevo.NombreyApellido.trim()) return;
    try {
      setSaving(true);
      // Aseguramos que pasamos los datos limpios al servicio
      await service.crearTrabajador({
        NombreyApellido: nuevo.NombreyApellido,
        Rol: nuevo.Rol
      });
      setIsOpen(false);
      setNuevo({ NombreyApellido: "", Rol: "Operario" });
      await cargarDatos();
    } catch (e) {
      console.error(e);
      alert("Error al guardar el empleado. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  const opcionesRol: IDropdownOption[] = [
    { key: "Operario", text: "Operario" },
    { key: "Jefe de Obra", text: "Jefe de Obra" },
    { key: "Administración", text: "Administración" },
  ];

  return (
    <div className={styles.container} style={{ padding: "20px" }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
          👥 Equipo EWS Energy
        </Text>
        {isAdmin && (
          <PrimaryButton
            text="Nuevo Personal"
            iconProps={{ iconName: "AddFriend" }}
            onClick={() => setIsOpen(true)}
          />
        )}
      </Stack>

      <div style={{ marginTop: "30px" }}>
        {loading ? (
          <Spinner size={SpinnerSize.large} label="Cargando personal..." />
        ) : empleados.length > 0 ? (
          <Stack horizontal wrap tokens={{ childrenGap: 30 }}>
            {empleados.map((emp) => (
              <Persona
                key={emp.Id}
                text={emp.NombreyApellido || "Empleado sin nombre"}
                secondaryText={emp.Rol || "Operario"}
                size={PersonaSize.size100}
                imageUrl={extraerUrlFoto(emp.FotoPerfil)}
              />
            ))}
          </Stack>
        ) : (
          <MessageBar messageBarType={MessageBarType.info}>
            No hay personal registrado en la lista.
          </MessageBar>
        )}
      </div>

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Dar de alta nuevo personal"
        closeButtonAriaLabel="Cerrar"
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
            options={opcionesRol}
            onChange={(_, opt) => setNuevo({ ...nuevo, Rol: opt?.key as string })}
          />

          {/* Bloque de botones corregido para evitar errores visuales */}
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