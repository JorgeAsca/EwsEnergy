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
  TextField,
  PrimaryButton,
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [nuevo, setNuevo] = React.useState({
    NombreyApellido: "",
    Rol: "Operario"
  });

  const service = React.useMemo(
    () => new PersonalService(props.context),
    [props.context],
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await service.getPersonal();
      setEmpleados(data);
      setError(null);
    } catch (err) {
      setError("Error al conectar con SharePoint. Verifica la lista 'Personal EWS'.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    if (!nuevo.NombreyApellido.trim()) return;
    try {
      await service.crearTrabajador({
        NombreyApellido: nuevo.NombreyApellido,
        Rol: nuevo.Rol
      });
      setNuevo({ NombreyApellido: "", Rol: "Operario" });
      await cargarDatos();
    } catch (err) {
      alert("Error al guardar el empleado.");
    }
  };

  if (loading) return <Spinner size={SpinnerSize.large} label="Cargando personal de EWS..." />;

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
        👥 Gestión de Personal
      </Text>

      {/* Formulario simple para el Admin */}
      <Stack
        horizontal
        verticalAlign="end"
        tokens={{ childrenGap: 10 }}
        style={{ background: "#f3f2f1", padding: 15, borderRadius: 5 }}
      >
        <TextField
          label="Nombre y Apellido"
          value={nuevo.NombreyApellido}
          onChange={(_, v) => setNuevo({ ...nuevo, NombreyApellido: v || "" })}
        />
        <PrimaryButton
          text="Registrar Empleado"
          onClick={handleGuardar}
          iconProps={{ iconName: "Add" }}
        />
      </Stack>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      <Stack horizontal wrap tokens={{ childrenGap: 25 }}>
        {empleados.map((emp) => (
          <Persona
            key={emp.Id}
            text={emp.NombreyApellido}
            secondaryText={emp.Rol}
            size={PersonaSize.size72}
            // La URL ahora se gestiona desde la columna FotoPerfil de la lista
            imageUrl={emp.FotoPerfil ? emp.FotoPerfil.Url : ""}
          />
        ))}
      </Stack>
    </Stack>
  );
};