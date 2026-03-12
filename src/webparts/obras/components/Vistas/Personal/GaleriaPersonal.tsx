import * as React from "react";
import {
  Stack,
  Text,
  Persona,
  PersonaSize,
  Spinner,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Panel,
  TextField,
  Dropdown,
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  // Seguridad: Comprobar si tiene permisos de edición (Admin)
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
      console.error("Fallo al renderizar personal:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  const getImageUrl = (fotoJson: any): string => {
    if (!fotoJson) return "";
    try {
      const parsed =
        typeof fotoJson === "string" ? JSON.parse(fotoJson) : fotoJson;
      return parsed.serverRelativeUrl || "";
    } catch {
      return "";
    }
  };

  return (
    <Stack tokens={{ childrenGap: 20 }} style={{ padding: 20 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
          👥 Personal EWS
        </Text>
        {isAdmin && (
          <PrimaryButton
            text="Añadir Personal"
            iconProps={{ iconName: "AddFriend" }}
            onClick={() => setIsOpen(true)}
          />
        )}
      </Stack>

      {loading ? (
        <Spinner label="Cargando..." />
      ) : (
        <Stack horizontal wrap tokens={{ childrenGap: 30 }}>
          {empleados.length > 0 ? (
            empleados.map((emp) => (
              <Persona
                key={emp.Id}
                // Usamos el nombre exacto corregido
                text={emp.NombreyApellido || "Sin nombre"}
                secondaryText={emp.Rol || "Operario"}
                size={PersonaSize.size100}
                imageUrl={getImageUrl(emp.FotoPerfil)}
              />
            ))
          ) : (
            <MessageBar messageBarType={MessageBarType.info}>
              No hay personal registrado.
            </MessageBar>
          )}
        </Stack>
      )}

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Nuevo Empleado"
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField
            label="Nombre y Apellido"
            required
            value={nuevo.NombreyApellido}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, NombreyApellido: v || "" })
            }
          />
          <Dropdown
            label="Rol"
            selectedKey={nuevo.Rol}
            options={[
              { key: "Operario", text: "Operario" },
              { key: "Jefe de Obra", text: "Jefe de Obra" },
              { key: "Administración", text: "Administración" },
            ]}
            onChange={(_, opt) =>
              setNuevo({ ...nuevo, Rol: opt?.key as string })
            }
          />
          <PrimaryButton
            text="Guardar"
            onClick={async () => {
              await service.crearTrabajador(nuevo);
              setIsOpen(false);
              cargarDatos();
            }}
          />
        </Stack>
      </Panel>
    </Stack>
  );
};
