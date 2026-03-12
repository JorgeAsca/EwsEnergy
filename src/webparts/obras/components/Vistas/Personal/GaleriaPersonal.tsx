import * as React from "react";
import {
  Stack, Text, Persona, PersonaSize, Spinner, 
  SpinnerSize, MessageBar, MessageBarType, TextField, 
  PrimaryButton, Panel, DefaultButton, Dropdown, IDropdownOption
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false); // Lógica de Admin
  const [saving, setSaving] = React.useState(false);
  
  const [nuevo, setNuevo] = React.useState({
    NombresyApellidos: "",
    Rol: "Operario"
  });

  const service = React.useMemo(() => new PersonalService(props.context), [props.context]);

  const verificarPermisos = () => {
    // Verificamos si el usuario tiene permisos de gestionar la lista o es admin del sitio
    const esAdmin = props.context.pageContext.web.permissions.hasPermission(1024); // ManageLists
    setIsAdmin(esAdmin);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await service.getPersonal();
      setEmpleados(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { 
    verificarPermisos();
    cargarDatos(); 
  }, []);

  const handleGuardar = async () => {
    try {
      setSaving(true);
      await service.crearTrabajador(nuevo);
      setIsOpen(false);
      setNuevo({ NombresyApellidos: "", Rol: "Operario" });
      await cargarDatos();
    } catch (err) {
      alert("Error: Verifica que el Rol sea válido en SharePoint.");
    } finally {
      setSaving(false);
    }
  };

  // Función corregida para procesar la imagen de SharePoint
  const getImageUrl = (fotoJson: any): string => {
    if (!fotoJson) return "";
    try {
      // Si SharePoint devuelve un string JSON (columna tipo Imagen)
      const parsed = typeof fotoJson === 'string' ? JSON.parse(fotoJson) : fotoJson;
      return parsed.serverRelativeUrl || parsed.Url || "";
    } catch {
      return "";
    }
  };

  const opcionesRol: IDropdownOption[] = [
    { key: 'Operario', text: 'Operario' },
    { key: 'Oficial', text: 'Oficial' },
    { key: 'Jefe de Obra', text: 'Jefe de Obra' },
    { key: 'Administración', text: 'Administración' }
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }} style={{ padding: 20 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
          👥 Gestión de Personal
        </Text>
        
        {/* SOLO SE MUESTRA SI ES ADMIN */}
        {isAdmin && (
          <PrimaryButton
            text="Nuevo Personal"
            iconProps={{ iconName: "AddFriend" }}
            onClick={() => setIsOpen(true)}
          />
        )}
      </Stack>

      {loading ? (
        <Spinner size={SpinnerSize.large} label="Cargando..." />
      ) : (
        <Stack horizontal wrap tokens={{ childrenGap: 30 }} style={{ marginTop: 20 }}>
          {empleados.map((emp) => (
            <Persona
              key={emp.Id}
              text={emp.NombreyApellido}
              secondaryText={emp.Rol}
              size={PersonaSize.size100}
              imageUrl={getImageUrl(emp.FotoPerfil)}
            />
          ))}
        </Stack>
      )}

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Dar de alta Personal"
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField
            label="Nombres y Apellidos"
            required
            value={nuevo.NombresyApellidos}
            onChange={(_, v) => setNuevo({ ...nuevo, NombresyApellidos: v || "" })}
          />
          
          <Dropdown
            label="Rol (Campo Opción)"
            selectedKey={nuevo.Rol}
            options={opcionesRol}
            onChange={(_, opt) => setNuevo({ ...nuevo, Rol: opt?.key as string })}
          />

          <MessageBar>
            Para la foto, súbala directamente desde la lista de SharePoint por ahora para asegurar la calidad.
          </MessageBar>

          <Stack tokens={{ childrenGap: 10 }} style={{ marginTop: 30 }}>
            {saving ? <Spinner /> : (
              <>
                <PrimaryButton text="Guardar" onClick={handleGuardar} disabled={!nuevo.NombresyApellidos} />
                <DefaultButton text="Cancelar" onClick={() => setIsOpen(false)} />
              </>
            )}
          </Stack>
        </Stack>
      </Panel>
    </Stack>
  );
};