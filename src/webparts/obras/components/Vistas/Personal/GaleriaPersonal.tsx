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
    FotoBase64: "", // Estado para guardar la captura temporal
  });

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [camaraAbierta, setCamaraAbierta] = React.useState(false);

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
      setError(
        "Error al conectar con SharePoint. Verifica la lista 'Personal EWS'.",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  // Lógica de Cámara
  const abrirCamara = async () => {
    try {
      setCamaraAbierta(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("No se pudo acceder a la cámara.");
      setCamaraAbierta(false);
    }
  };

  const capturarFoto = () => {
    const canvas = document.createElement("canvas");
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg");
      setNuevo({ ...nuevo, FotoBase64: dataUrl }); // Guardamos la foto en el estado del nuevo empleado

      // Detener cámara
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCamaraAbierta(false);
    }
  };

  const handleGuardar = async () => {
    if (!nuevo.NombreyApellido.trim()) return;
    try {
      // Enviamos el objeto al servicio (el servicio deberá procesar la FotoBase64 si decides guardarla)
      await service.crearTrabajador({
        NombreyApellido: nuevo.NombreyApellido,
        Rol: nuevo.Rol,
      });

      setNuevo({ NombreyApellido: "", Rol: "Operario", FotoBase64: "" });
      await cargarDatos();
    } catch (err) {
      alert("Error al guardar el empleado.");
    }
  };

  if (loading)
    return (
      <Spinner size={SpinnerSize.large} label="Cargando personal de EWS..." />
    );

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
        👥 Gestión de Personal
      </Text>

      <Stack
        tokens={{ childrenGap: 15 }}
        style={{ background: "#f3f2f1", padding: 20, borderRadius: 8 }}
      >
        <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 10 }}>
          <TextField
            label="Nombre y Apellido"
            value={nuevo.NombreyApellido}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, NombreyApellido: v || "" })
            }
            style={{ width: 250 }}
          />

          {/* Botón para abrir cámara o mostrar miniatura de la foto tomada */}
          <Stack verticalAlign="end">
            {nuevo.FotoBase64 ? (
              <img
                src={nuevo.FotoBase64}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #004a99",
                }}
                onClick={abrirCamara}
              />
            ) : (
              <IconButton
                iconProps={{ iconName: "Camera" }}
                title="Tomar Foto"
                onClick={abrirCamara}
                styles={{ root: { marginBottom: 4 } }}
              />
            )}
          </Stack>

          <PrimaryButton
            text="Registrar Empleado"
            onClick={handleGuardar}
            iconProps={{ iconName: "Add" }}
          />
        </Stack>

        {/* Visor de Cámara Condicional */}
        {camaraAbierta && (
          <Stack
            horizontalAlign="center"
            tokens={{ childrenGap: 10 }}
            style={{ marginTop: 10 }}
          >
            <video
              ref={videoRef}
              autoPlay
              style={{ width: 300, borderRadius: 8, background: "#000" }}
            />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton
                text="Capturar"
                onClick={capturarFoto}
                iconProps={{ iconName: "Photo2" }}
              />
              <PrimaryButton
                text="Cancelar"
                onClick={() => setCamaraAbierta(false)}
              />
            </Stack>
          </Stack>
        )}
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
        {empleados.map((emp) => (
          <Persona
            key={emp.Id}
            text={emp.NombreyApellido}
            secondaryText={emp.Rol}
            size={PersonaSize.size72}
            imageUrl={emp.FotoPerfil?.Url} // Aquí se mostrará la foto cuando implementemos la subida
          />
        ))}
      </Stack>
    </Stack>
  );
};
