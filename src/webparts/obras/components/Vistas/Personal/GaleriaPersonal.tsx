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
    Rol: "Operario",
    EmpresaAsociadaId: "", // Lo dejamos como string vacío para el input
  });

  const service = React.useMemo(
    () => new PersonalService(props.context),
    [props.context],
  );

  const cargarDatos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getPersonal();
      setEmpleados(data);
    } catch (err) {
      console.error("Detalle del error:", err);
      setError(
        "Error al conectar con la lista 'Personal EWS'. Verifica que las columnas existan.",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (props.context) {
      cargarDatos().catch(console.error);
    }
  }, [props.context]);

  const handleGuardar = async (): Promise<void> => {
    if (!nuevo.NombreyApellido.trim()) return;

    try {
      await service.crearTrabajador({
        NombreyApellido: nuevo.NombreyApellido,
        Rol: nuevo.Rol,
        // Convertimos a número antes de enviar, igual que en otros servicios funcionales
        EmpresaAsociadaId: nuevo.EmpresaAsociadaId
          ? parseInt(nuevo.EmpresaAsociadaId)
          : undefined,
      });

      // Limpieza de campos tras éxito
      setNuevo({ NombreyApellido: "", Rol: "Operario", EmpresaAsociadaId: "" });
      await cargarDatos();
    } catch (err) {
      alert(
        "Error al guardar. Revisa si el nombre interno de la columna es correcto.",
      );
    }
  };

  if (loading)
    return <Spinner size={SpinnerSize.large} label="Cargando personal..." />;

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge">👥 Personal de EWS</Text>

      <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 10 }}>
        <TextField
          label="Nombre y Apellido"
          value={nuevo.NombreyApellido}
          onChange={(_, v) => setNuevo({ ...nuevo, NombreyApellido: v || "" })}
        />
        <TextField
          label="ID Empresa"
          value={nuevo.EmpresaAsociadaId}
          onChange={(_, v) =>
            setNuevo({ ...nuevo, EmpresaAsociadaId: v || "" })
          }
        />
        <PrimaryButton text="Registrar" onClick={handleGuardar} />
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
        {empleados.map((emp) => (
          <Persona
            key={emp.Id}
            text={emp.NombreyApellido} // CAMBIO: Usamos NombreyApellido
            secondaryText={emp.Rol}
            imageUrl={emp.FotoPerfil?.Url}
            size={PersonaSize.size72}
          />
        ))}
      </Stack>
    </Stack>
  );
};
