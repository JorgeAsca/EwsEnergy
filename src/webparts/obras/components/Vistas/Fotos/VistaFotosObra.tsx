import * as React from "react";
import {
    Stack,
    Text,
    Persona,
    PersonaSize,
    PrimaryButton,
    DefaultButton,
    Spinner,
    SpinnerSize,
    MessageBar,
    MessageBarType,
    TextField,
    Icon,
} from "@fluentui/react";
import { IPersonal } from "../../../models/IPersonal";
import { IAsignacion } from "../../../models/IAsignacion";
import { IObra } from "../../../models/IObra";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { ProjectService } from "../../../service/ProjectService";
import { PhotoService } from "../../../service/PhotoService";

import styles from "./VistaFotosObra.module.scss";

export const VistaFotosObra: React.FC<{ context: any }> = (props) => {
    const [paso, setPaso] = React.useState(1);
    const [loading, setLoading] = React.useState(true);
    const [subiendo, setSubiendo] = React.useState(false);
    const [fotosHoy, setFotosHoy] = React.useState<any[]>([]);

    // Estados de selección
    const [operario, setOperario] = React.useState<IPersonal | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = React.useState<IObra | null>(
        null,
    );

    // Estados de datos
    const [data, setData] = React.useState<{
        personal: IPersonal[];
        asignaciones: IAsignacion[];
        obras: IObra[];
    }>({
        personal: [],
        asignaciones: [],
        obras: [],
    });

    // Estados del Reporte (Captura actual)
    const [fotos, setFotos] = React.useState<File[]>([]);
    const [comentarios, setComentarios] = React.useState("");

    const services = React.useMemo(
        () => ({
            personal: new PersonalService(props.context),
            asignaciones: new AsignacionesService(props.context),
            proyectos: new ProjectService(props.context),
            photos: new PhotoService(props.context),
        }),
        [props.context],
    );

    React.useEffect(() => {
        const init = async (): Promise<void> => {
            try {
                setLoading(true);
                const [p, a, o] = await Promise.all([
                    services.personal.getPersonal(),
                    services.asignaciones.getAsignaciones(),
                    services.proyectos.getObras(),
                ]);

                setData({
                    personal: p || [],
                    asignaciones: a || [],
                    obras: o || [],
                });
            } catch (e) {
                console.error("Error inicializando vista:", e);
            } finally {
                setLoading(false);
            }
        };
        init().catch((err) => console.error(err));
    }, [services]);

    const cargarActividadHoy = async (id: number) => {
        try {
            const historial = await services.photos.getFotosHoyPorOperario(id);
            setFotosHoy(historial);
        } catch (e) {
            console.error("Error cargando actividad de hoy", e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const nuevasFotos = Array.from(e.target.files);
            setFotos((prev) => [...prev, ...nuevasFotos].slice(0, 5));
        }
    };

    const quitarFoto = (index: number) => {
        setFotos((prev) => prev.filter((_, i) => i !== index));
    };

    const enviarReporte = async () => {
        if (!operario || !obraSeleccionada || fotos.length === 0) return;

        try {
            setSubiendo(true);
            for (const foto of fotos) {
                await services.photos.subirFotoProyecto(foto, obraSeleccionada.Title, {
                    operario: operario.NombreyApellido,
                    operarioId: operario.Id,
                    comentarios: comentarios,
                });
            }

            alert("✅ Reporte enviado con éxito.");
            setFotos([]);
            setComentarios("");
            // Recargar la actividad de hoy antes de volver
            await cargarActividadHoy(operario.Id);
            setPaso(2);
        } catch (error) {
            console.error("Error al subir reporte:", error);
            alert("❌ Hubo un error al subir las fotos. Revisa SharePoint.");
        } finally {
            setSubiendo(false);
        }
    };

    const esObraAsignada = (obraId: number | undefined): boolean => {
        if (!operario || !obraId) return false;
        return data.asignaciones.some(
            (asign) =>
                Number(asign.PersonalId) === Number(operario.Id) &&
                Number(asign.ObraId) === Number(obraId),
        );
    };

    if (loading)
        return (
            <Spinner size={SpinnerSize.large} label="Cargando sistema furgoneta..." />
        );

    return (
        <div className={styles.container}>
            {/* PASO 1: SELECCIÓN DE PERFIL */}
            {paso === 1 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Text variant="xxLarge" className={styles.titulo}>
                        🚛 Reporte de Furgoneta
                    </Text>
                    <Text variant="large">Selecciona tu perfil:</Text>
                    <div className={styles.gridPersonal}>
                        {data.personal.map((p) => (
                            <div
                                key={p.Id}
                                className={styles.personaCard}
                                onClick={() => {
                                    setOperario(p);
                                    cargarActividadHoy(p.Id);
                                    setPaso(2);
                                }}
                            >
                                <Persona
                                    text={p.NombreyApellido}
                                    imageUrl={p.FotoPerfil}
                                    size={PersonaSize.size72}
                                />
                            </div>
                        ))}
                    </div>
                </Stack>
            )}

            {/* PASO 2: ACTIVIDAD DE HOY Y SELECCIÓN DE OBRA */}
            {paso === 2 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Stack
                        horizontal
                        horizontalAlign="space-between"
                        verticalAlign="center"
                    >
                        <Text variant="xLarge">
                            Sesión de: <b>{operario ? operario.NombreyApellido : ""}</b>
                        </Text>
                        <DefaultButton
                            text="Cambiar usuario"
                            onClick={() => {
                                setOperario(null);
                                setFotosHoy([]);
                                setPaso(1);
                            }}
                        />
                    </Stack>

                    {/* GALERÍA DE ACTIVIDAD RECIENTE (HOY) */}
                    {fotosHoy.length > 0 && (
                        <div className={styles.seccionHoy}>
                            <Text variant="large" className={styles.subtituloHoy}>
                                📸 Tus fotos de hoy ({fotosHoy.length})
                            </Text>
                            <div className={styles.scrollHorizontal}>
                                {fotosHoy.map((f, i) => (
                                    <div key={i} className={styles.cardFotoHoy}>
                                        <img src={f.UrlFoto.Url} alt="Actividad" />
                                        <Text variant="small" className={styles.tagObra}>
                                            {f.Title}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Text variant="large">Selecciona la obra activa:</Text>
                    <div className={styles.listaObras}>
                        {data.obras.map((o) => {
                            const resaltada = esObraAsignada(o.Id);
                            return (
                                <DefaultButton
                                    key={o.Id}
                                    className={`${styles.botonObra} ${resaltada ? styles.resaltada : ""}`}
                                    onClick={() => {
                                        setObraSeleccionada(o);
                                        setPaso(3);
                                    }}
                                >
                                    <Stack
                                        horizontal
                                        horizontalAlign="space-between"
                                        verticalAlign="center"
                                        style={{ width: "100%" }}
                                    >
                                        <Text variant="large">
                                            {resaltada ? "⭐ " : ""}
                                            {o.Title}
                                        </Text>
                                        {resaltada && (
                                            <span className={styles.badgeAsignada}>
                                                OBRA ASIGNADA
                                            </span>
                                        )}
                                    </Stack>
                                </DefaultButton>
                            );
                        })}
                    </div>
                </Stack>
            )}

            {/* PASO 3: CAPTURA Y ENVÍO */}
            {paso === 3 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Stack
                        horizontal
                        horizontalAlign="space-between"
                        verticalAlign="center"
                    >
                        <Text variant="xLarge">
                            Reporte: <b>{obraSeleccionada?.Title}</b>
                        </Text>
                        <DefaultButton
                            text="Cancelar"
                            onClick={() => setPaso(2)}
                            disabled={subiendo}
                        />
                    </Stack>

                    <div className={styles.uploadCard}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            id="camera-input"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <PrimaryButton
                            iconProps={{ iconName: "Camera" }}
                            text="Capturar Fotos del Día"
                            onClick={() => document.getElementById("camera-input")?.click()}
                            disabled={fotos.length >= 5 || subiendo}
                        />
                        <Text variant="small" block style={{ marginTop: 8 }}>
                            {fotos.length} / 5 fotos seleccionadas
                        </Text>
                    </div>

                    <div className={styles.previewGrid}>
                        {fotos.map((f, i) => (
                            <div key={i} className={styles.thumbContainer}>
                                <img
                                    src={URL.createObjectURL(f)}
                                    className={styles.previewImage}
                                />
                                <div
                                    className={styles.deleteIcon}
                                    onClick={() => quitarFoto(i)}
                                >
                                    <Icon iconName="Cancel" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <TextField
                        label="Comentarios del Personal"
                        multiline
                        rows={3}
                        value={comentarios}
                        onChange={(_, v) => setComentarios(v || "")}
                        placeholder="Escribe aquí novedades o detalles del trabajo de hoy..."
                    />

                    {subiendo ? (
                        <Spinner
                            size={SpinnerSize.large}
                            label="Subiendo fotos y registrando metadatos..."
                        />
                    ) : (
                        <PrimaryButton
                            text="Finalizar y Enviar Reporte"
                            onClick={enviarReporte}
                            disabled={fotos.length === 0}
                            style={{ height: "50px", fontSize: "16px" }}
                        />
                    )}
                </Stack>
            )}
        </div>
    );
};
