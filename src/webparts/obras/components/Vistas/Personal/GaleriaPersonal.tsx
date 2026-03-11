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
  IconButton,
  Dropdown,
  IDropdownOption,
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

export interface IGaleriaPersonalProps {
  context: any;
}

export const GaleriaPersonal: React.FC<IGaleriaPersonalProps> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Estado para el formulario de nuevo personal
  const [nuevo, setNuevo] = React.useState({
    Title: "",
    Rol: "Operario",
    Email: "",
  });

  // Instanciamos el servicio
  const service = new PersonalService(props.context);

  const opcionesRoles: IDropdownOption[] = [
    { key: "Operario", text: "Operario" },
    { key: "Manager", text: "Manager" },
    { key: "Administrador", text: "Administrador" },
  ];

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Agregamos 'await' para esperar a que SharePoint responda
      const data = await service.getPersonal();
      setEmpleados(data);
    } catch (err) {
      setError("Error al conectar con la lista 'Personal EWS'");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!nuevo.Title || !nuevo.Email) {
      alert("Por favor, rellena el nombre y el correo.");
      return;
    }
    try {
      await service.crearTrabajador(nuevo);
      setNuevo({ Title: "", Rol: "Operario", Email: "" });
      cargarDatos();
    } catch (err) {
      alert("Error al registrar el personal.");
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar a este trabajador?")) {
      try {
        await service.eliminarTrabajador(id);
        cargarDatos();
      } catch (err) {
        alert("Error al eliminar.");
      }
    }
  };

  const handleEditar = async (emp: IPersonal) => {
    const nuevoNombre = window.prompt("Nuevo nombre:", emp.Title);
    if (nuevoNombre && nuevoNombre !== emp.Title) {
      try {
        await service.actualizarTrabajador(emp.Id, { Title: nuevoNombre });
        cargarDatos();
      } catch (err) {
        alert("Error al actualizar.");
      }
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  if (loading)
    return <Spinner size={SpinnerSize.large} label="Cargando personal..." />;

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
        👥 Personal de EWS
      </Text>

      {/* Formulario de Alta */}
      <Stack
        horizontal
        verticalAlign="end"
        tokens={{ childrenGap: 10 }}
        style={{ background: "#f3f2f1", padding: "20px", borderRadius: "8px" }}
      >
        <TextField
          label="Nombre Completo"
          value={nuevo.Title}
          onChange={(_, val) => setNuevo({ ...nuevo, Title: val || "" })}
        />
        <TextField
          label="Email"
          value={nuevo.Email}
          onChange={(_, val) => setNuevo({ ...nuevo, Email: val || "" })}
        />
        <Dropdown
          label="Rol"
          selectedKey={nuevo.Rol}
          options={opcionesRoles}
          onChange={(_, opt) =>
            setNuevo({ ...nuevo, Rol: (opt?.key as string) || "Operario" })
          }
          styles={{ dropdown: { width: 150 } }}
        />
        <PrimaryButton
          text="Registrar"
          onClick={handleGuardar}
          iconProps={{ iconName: "AddFriend" }}
        />
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      <Stack horizontal wrap tokens={{ childrenGap: 30 }}>
        {empleados.length > 0
          ? empleados.map((emp) => (
              <Stack
                key={emp.Id}
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <Stack
                  horizontal
                  horizontalAlign="end"
                  style={{ position: "absolute", top: 5, right: 5 }}
                >
                  <IconButton
                    iconProps={{ iconName: "Edit" }}
                    onClick={() => handleEditar(emp)}
                    title="Editar"
                  />
                  <IconButton
                    iconProps={{ iconName: "Delete" }}
                    onClick={() => handleEliminar(emp.Id)}
                    title="Eliminar"
                  />
                </Stack>
                <Persona
                  text={emp.Title}
                  secondaryText={emp.Rol}
                  tertiaryText={emp.Email}
                  size={PersonaSize.size72}
                />
              </Stack>
            ))
          : !error && <Text>No hay empleados registrados.</Text>}
      </Stack>
    </Stack>
  );
};
