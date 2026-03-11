import * as React from 'react';
import { Stack, Text, Persona, PersonaSize, PersonaPresence } from '@fluentui/react';

export const GaleriaPersonal: React.FC = () => {
  // Datos de prueba (Mocks)
  const empleados = [
    { nombre: 'Juan Pérez', cargo: 'Operario Especialista', foto: '' },
    { nombre: 'Ana García', cargo: 'Manager de Obra', foto: '' },
    { nombre: 'Carlos Ruiz', cargo: 'Técnico Eléctrico', foto: '' }
  ];

  return (
    <Stack tokens={{ childrenGap: 25 }}>
      <Text variant="xxLarge">👥 Galería de Personal</Text>
      <Stack horizontal wrap tokens={{ childrenGap: 30 }}>
        {empleados.map((emp, i) => (
          <Persona
            key={i}
            imageUrl={emp.foto}
            text={emp.nombre}
            secondaryText={emp.cargo}
            size={PersonaSize.size72}
            presence={PersonaPresence.online}
          />
        ))}
      </Stack>
    </Stack>
  );
};