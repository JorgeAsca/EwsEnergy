// src/webparts/obras/components/Vistas/Personal/GaleriaPersonal.tsx
import * as React from "react";
import {
  Stack, Text, Persona, PersonaSize, Spinner, SpinnerSize, MessageBar, 
  MessageBarType, PrimaryButton, DefaultButton, Panel, TextField, Dropdown, IDropdownOption
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [rolOptions, setRolOptions] = React.useState<IDropdownOption[]>([]);
  const [fotoOptions, setFotoOptions] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [nuevo, setNuevo] = React.useState({
    NombreyApellido: "",
    Rol: "",
    FotoPerfil: "" 
  });

  const service = React.useMemo(() => new PersonalService(props.context), [props.context]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [data, opciones, fotos] = await Promise.all([
        service.getPersonal(),
        service.getRolOptions(),
        service.getFotosDisponibles()
      ]);

      setEmpleados(data || []);
      setRolOptions(opciones.map(opt => ({ key: opt, text: opt })));
      setFotoOptions(fotos.map(f => ({ key: f.url, text: f.text })));

      if (opciones.length > 0) {
        setNuevo(prev => ({ ...prev, Rol: opciones[0] }));
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
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
      // Limpiar formulario
      setNuevo({ NombreyApellido: "", Rol: rolOptions[0]?.key as string || "", FotoPerfil: "" });
      await cargarDatos();
    } catch (e) {
      console.error("Error al guardar:", e);
      alert("Error al guardar en SharePoint. Revisa la consola para más detalles.");
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
                  text={emp.NombreyApellido}
                  secondaryText={emp.Rol}
                  imageUrl={emp.FotoPerfil}
                  size={PersonaSize.size100}
                />
              ))
            ) : (
              <MessageBar messageBarType={MessageBarType.info}>
                No se encontraron empleados en la lista.
              </MessageBar>
            )}
          </Stack>
        )}
      </div>

      <Panel isOpen={isOpen} onDismiss={() => setIsOpen(false)} headerText="Alta de Personal">
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField 
            label="Nombre y Apellido" 
            required 
            value={nuevo.NombreyApellido} 
            onChange={(_, v) => setNuevo({ ...nuevo, NombreyApellido: v || "" })} 
          />
          
          <Dropdown 
            label="Rol / Cargo" 
            options={rolOptions} 
            selectedKey={nuevo.Rol}
            onChange={(_, opt) => setNuevo({ ...nuevo, Rol: opt?.key as string })} 
          />

          <Dropdown 
            label="Seleccionar Foto de la Biblioteca"
            placeholder="Elige una imagen..."
            options={fotoOptions}
            selectedKey={nuevo.FotoPerfil}
            onChange={(_, opt) => setNuevo({ ...nuevo, FotoPerfil: opt?.key as string })}
          />

          {nuevo.FotoPerfil && (
            <Stack horizontalAlign="center" style={{ marginTop: 10 }}>
              <Text variant="small">Vista previa:</Text>
              <Persona imageUrl={nuevo.FotoPerfil} size={PersonaSize.size72} hidePersonaDetails />
            </Stack>
          )}

          <Stack horizontal tokens={{ childrenGap: 10 }} style={{ marginTop: 30 }}>
            {saving ? (
              <Spinner label="Guardando..." />
            ) : (
              <>
                <PrimaryButton text="Guardar" onClick={handleGuardar} disabled={!nuevo.NombreyApellido.trim()} />
                <DefaultButton text="Cancelar" onClick={() => setIsOpen(false)} />
              </>
            )}
          </Stack>
        </Stack>
      </Panel>
    </div>
  );
};