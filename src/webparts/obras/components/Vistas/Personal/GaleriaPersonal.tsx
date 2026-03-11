import * as React from 'react';
import { 
  Stack, 
  Text, 
  Persona, 
  PersonaSize, 
  PersonaPresence, 
  Spinner, 
  SpinnerSize, 
  MessageBar, 
  MessageBarType 
} from '@fluentui/react';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IGaleriaPersonalProps {
  context: any; // Recibimos el contexto de SharePoint
}

export const GaleriaPersonal: React.FC<IGaleriaPersonalProps> = (props) => {
  const [empleados, setEmpleados] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Función para cargar los datos de la lista 'Personal'
  const cargarPersonal = async () => {
    try {
      const url = `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Personal')/items`;
      const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      
      if (response.ok) {
        const data = await response.json();
        setEmpleados(data.value || []);
      } else {
        setError("No se encontró la lista 'Personal'. Asegúrate de crearla en SharePoint.");
      }
    } catch (err) {
      setError("Error de conexión con SharePoint");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (props.context) {
      cargarPersonal();
    }
  }, [props.context]);

  if (loading) return <Spinner size={SpinnerSize.large} label="Cargando personal..." />;

  return (
    <Stack tokens={{ childrenGap: 25 }}>
      <Text variant="xxLarge" style={{ color: '#004a99', fontWeight: 600 }}>👥 Personal de EWS</Text>
      
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>
          {error}
        </MessageBar>
      )}

      <Stack horizontal wrap tokens={{ childrenGap: 30 }}>
        {empleados.length > 0 ? (
          empleados.map((emp, i) => (
            <Persona
              key={i}
              imageUrl={emp.FotoPerfil} // Asegúrate que la columna se llame así
              text={emp.Title} // Nombre del empleado
              secondaryText={emp.Rol} // Cargo o Rol
              tertiaryText={emp.Email}
              size={PersonaSize.size72}
              presence={PersonaPresence.online}
            />
          ))
        ) : (
          !error && <Text>No hay empleados registrados en la lista.</Text>
        )}
      </Stack>
    </Stack>
  );
};