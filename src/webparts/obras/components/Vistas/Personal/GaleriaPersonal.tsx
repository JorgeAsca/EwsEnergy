import * as React from 'react';
import { 
  Stack, Text, Persona, PersonaSize, Spinner, 
  SpinnerSize, MessageBar, MessageBarType, TextField, PrimaryButton, IconButton 
} from '@fluentui/react';
import { PersonalService } from '../../../service/PersonalService';
import { IPersonal } from '../../../models/IPersonal';

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nuevo, setNuevo] = React.useState({ Title: '', Rol: 'Operario', Email: '' });

  
  const service = React.useMemo(() => new PersonalService(props.context), [props.context]);

  const cargarDatos = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getPersonal(); 
      setEmpleados(data);
    } catch (err) {
      console.error("Detalle del error:", err);
      setError("Error al conectar con la lista 'Personal EWS'. Revisa los nombres de las columnas.");
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
    if (!nuevo.Title || !nuevo.Email) return;
    try {
      await service.crearTrabajador(nuevo);
      setNuevo({ Title: '', Rol: 'Operario', Email: '' });
      await cargarDatos();
    } catch (err) {
      alert("Error al guardar trabajador");
    }
  };

  if (loading) return <Spinner size={SpinnerSize.large} label="Cargando personal..." />;

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge">👥 Personal de EWS</Text>
      
      {/* Formulario de Alta */}
      <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 10 }}>
        <TextField label="Nombre" value={nuevo.Title} onChange={(_, v) => setNuevo({...nuevo, Title: v || ''})} />
        <TextField label="Email" value={nuevo.Email} onChange={(_, v) => setNuevo({...nuevo, Email: v || ''})} />
        <PrimaryButton text="Registrar" onClick={handleGuardar} />
      </Stack>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
        {empleados.map((emp) => (
          <Persona
            key={emp.Id}
            text={emp.Title}
            secondaryText={emp.Rol}
            tertiaryText={emp.Email}
            size={PersonaSize.size72}
          />
        ))}
      </Stack>
    </Stack>
  );
};