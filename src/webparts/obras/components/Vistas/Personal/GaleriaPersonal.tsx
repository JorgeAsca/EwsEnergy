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
  IDropdownOption,
  Icon
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [rolOptions, setRolOptions] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  
  // Estado para el archivo de imagen seleccionado
  const [archivoFoto, setArchivoFoto] = React.useState<File | null>(null);

  const [nuevo, setNuevo] = React.useState({
    NombreyApellido: "",
    Rol: "",
  });

  const service = React.useMemo(
    () => new PersonalService(props.context),
    [props.context],
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargamos empleados y las opciones de rol de forma dinámica desde SharePoint
      const [data, opciones] = await Promise.all([
        service.getPersonal(),
        service.getRolOptions()
      ]);

      setEmpleados(data || []);
      
      const mappedOptions = opciones.map(opt => ({ key: opt, text: opt }));
      setRolOptions(mappedOptions);

      // Establecemos el rol inicial basado en la primera opción disponible
      if (mappedOptions.length > 0 && !nuevo.Rol) {
        setNuevo(prev => ({ ...prev, Rol: mappedOptions[0].key as string }));
      }
    } catch (err) {
      console.error("Error cargando personal:", err);
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
      let urlFotoSubida = "";

      // 1. Si el usuario seleccionó una imagen, la subimos primero a la biblioteca 'FotosPersonal'
      if (archivoFoto) {
        urlFotoSubida = await service.subirFoto(archivoFoto);
      }

      // 2. Creamos el trabajador enviando la URL de la foto al campo de Hipervínculo
      await service.crearTrabajador({ 
        ...nuevo, 
        FotoPerfil: urlFotoSubida 
      });

      setIsOpen(false);
      setArchivoFoto(null); // Limpiamos el selector de archivos
      setNuevo({ NombreyApellido: "", Rol: rolOptions[0]?.key as string || "" });
      await cargarDatos();
    } catch (e) {
      console.error("Error al guardar:", e);
      alert(
        "Error al guardar en SharePoint. Verifica que la biblioteca 'FotosPersonal' exista y la columna 'FotoPerfil' sea de tipo Hipervínculo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption,
  ): void => {
    if (option) {
      setNuevo({ ...nuevo, Rol: option.key as string });
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
                  text={emp.NombreyApellido || "Sin nombre"}
                  secondaryText={emp.Rol || "EWS Energy"}
                  imageUrl={emp.FotoPerfil} // Muestra la foto desde la biblioteca
                  size={PersonaSize.size100}
                />
              ))
            ) : (
              <MessageBar messageBarType={MessageBarType.info}>
                No se encontraron datos. Asegúrate de que los registros en
                SharePoint tengan el campo 'Título' (Title) completado.
              </MessageBar>
            )}
          </Stack>
        )}
      </div>

      <Panel
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        headerText="Dar de alta nuevo empleado"
        closeButtonAriaLabel="Cerrar"
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField
            label="Nombre y Apellido"
            required
            placeholder="Escribe el nombre completo..."
            value={nuevo.NombreyApellido}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, NombreyApellido: v || "" })
            }
          />

          <Dropdown
            label="Rol / Cargo"
            selectedKey={nuevo.Rol}
            options={rolOptions}
            onChange={onDropdownChange}
          />

          {/* Sección de carga de imagen */}
          <div>
            <Text block style={{ marginBottom: 8, fontWeight: 600 }}>Foto de Perfil</Text>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              id="input-foto-personal" 
              onChange={(e) => setArchivoFoto(e.target.files?.[0] || null)} 
            />
            <DefaultButton 
              text={archivoFoto ? archivoFoto.name : "Seleccionar Imagen"} 
              iconProps={{ iconName: 'Photo2' }} 
              onClick={() => document.getElementById('input-foto-personal')?.click()} 
            />
            {archivoFoto && (
              <Text variant="small" style={{ marginLeft: 10, color: '#107c10' }}>
                <Icon iconName="CheckMark" /> Lista para subir
              </Text>
            )}
          </div>

          <Stack
            horizontal
            tokens={{ childrenGap: 10 }}
            style={{ marginTop: 30 }}
          >
            {saving ? (
              <Spinner label="Subiendo información..." />
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