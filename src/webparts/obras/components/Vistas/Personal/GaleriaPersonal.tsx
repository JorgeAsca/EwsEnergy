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
    NombreyApellido: '', 
    Rol: 'Operario' 
  });

  const service = React.useMemo(() => new PersonalService(props.context), [props.context]);

  const cargarDatos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getPersonal(); 
      setEmpleados(data);
    } catch (err) {
      console.error("Error al cargar:", err);
      setError("Error al cargar la lista. Probablemente la columna 'EmpresaAsociadaId' no existe.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos().catch(console.error);
  }, []);

  const handleGuardar = async (): Promise<void> => {
    if (!nuevo.NombreyApellido.trim()) return;
    
    try {
      
      await service.crearTrabajador({
        NombreyApellido: nuevo.NombreyApellido,
        Rol: nuevo.Rol
      });
      
      setNuevo({ NombreyApellido: '', Rol: 'Operario' });
      await cargarDatos();
      alert("¡Guardado correctamente!");
    } catch (err) {
      alert("Error al guardar. Revisa la consola.");
    }
  };

  if (loading) return <Spinner size={SpinnerSize.large} label="Cargando..." />;

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge">👥 Personal de EWS (Prueba de Conexión)</Text>
      
      <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 10 }}>
        <TextField 
          label="Nombre y Apellido" 
          value={nuevo.NombreyApellido} 
          onChange={(_, v) => setNuevo({...nuevo, NombreyApellido: v || ''})} 
        />
        <PrimaryButton text="Registrar" onClick={handleGuardar} />
      </Stack>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
        {empleados.map((emp) => (
          <Persona
            key={emp.Id}
            text={emp.NombreyApellido}
            secondaryText={emp.Rol}
            size={PersonaSize.size72}
          />
        ))}
      </Stack>
    </Stack>
  );
};