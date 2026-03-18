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
    Separator,
    IconButton
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

    const [operario, setOperario] = React.useState<IPersonal | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = React.useState<IObra | null>(null);
    const [fotos, setFotos] = React.useState<File[]>([]);
    const [comentarios, setComentarios] = React.useState("");

    const [data, setData] = React.useState<{
        personal: IPersonal[];
        asignaciones: IAsignacion[];
        obras: IObra[];
    }>({ personal: [], asignaciones: [], obras: [] });

    const services = React.useMemo(() => ({
        personal: new PersonalService(props.context),
        asignaciones: new AsignacionesService(props.context),
        proyectos: new ProjectService(props.context),
        photos: new PhotoService(props.context),
    }), [props.context]);

    React.useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [p, a, o] = await Promise.all([
                    services.personal.getPersonal(),
                    services.asignaciones.getAsignaciones(),
                    services.proyectos.getObras(),
                ]);
                setData({ personal: p || [], asignaciones: a || [], obras: o || [] });
            } catch (e) { console.error(e); } 
            finally { setLoading(false); }
        };
        init();
    }, [services]);

    const cargarActividadHoy = async (id: number) => {
        const historial = await services.photos.getFotosHoyPorOperario(id);
        setFotosHoy(historial || []);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const nuevasFotos = Array.from(e.target.files);
            setFotos((prev) => [...prev, ...nuevasFotos].slice(0, 5));
        }
    };

    const enviarReporte = async () => {
        if (!operario || !obraSeleccionada || fotos.length === 0) return;
        try {
            setSubiendo(true);
            for (const foto of fotos) {
                await services.photos.subirFotoProyecto(foto, obraSeleccionada.Title, {
                    operario: operario.NombreyApellido,
                    operarioId: operario.Id,
                    obraId: obraSeleccionada.Id,
                    comentarios: comentarios,
                });
            }
            setFotos([]);
            setComentarios("");
            await cargarActividadHoy(operario.Id);
            setPaso(2);
        } catch (error) {
            alert("❌ Error al subir reporte.");
        } finally { setSubiendo(false); }
    };

    const esObraAsignada = (obraId: number | undefined): boolean => {
        if (!operario || !obraId) return false;
        return data.asignaciones.some(a => Number(a.PersonalId) === Number(operario.Id) && Number(a.ObraId) === Number(obraId));
    };

    if (loading) return <Spinner size={SpinnerSize.large} label="Iniciando terminal de reporte..." className={styles.loader} />;

    return (
        <div className={styles.container}>
            {/* CABECERA DINÁMICA */}
            <header className={styles.appHeader}>
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                    <div className={styles.iconCircle}><Icon iconName="ViewDashboard" /></div>
                    <Stack>
                        <Text variant="xLarge" className={styles.title}>EWS Energy</Text>
                        <Text variant="small" className={styles.subtitle}>Reporte Diario de Obra</Text>
                    </Stack>
                </Stack>
                {operario && (
                    <Persona 
                        text={operario.NombreyApellido} 
                        size={PersonaSize.size32} 
                        className={styles.userBadge} 
                        onClick={() => setPaso(1)}
                    />
                )}
            </header>

            <main className={styles.content}>
                {/* PASO 1: SELECCIÓN DE PERSONAL */}
                {paso === 1 && (
                    <section className={styles.fadein}>
                        <Text variant="xxLarge" className={styles.stepTitle}>¿Quién eres hoy?</Text>
                        <div className={styles.gridPersonal}>
                            {data.personal.map((p) => (
                                <button key={p.Id} className={styles.cardPersona} onClick={() => {
                                    setOperario(p);
                                    cargarActividadHoy(p.Id);
                                    setPaso(2);
                                }}>
                                    <Persona
                                        text={p.NombreyApellido}
                                        imageUrl={p.FotoPerfil}
                                        size={PersonaSize.size100}
                                        hidePersonaDetails
                                    />
                                    <Text variant="large" className={styles.cardName}>{p.NombreyApellido}</Text>
                                    <Text variant="small" className={styles.cardRole}>{p.Rol || 'Operario'}</Text>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* PASO 2: SELECCIÓN DE OBRA */}
                {paso === 2 && (
                    <section className={styles.fadein}>
                        <div className={styles.sectionHeader}>
                            <IconButton iconProps={{iconName: 'Back'}} onClick={() => setPaso(1)} />
                            <Text variant="xxLarge" className={styles.stepTitle}>Selecciona la Obra</Text>
                        </div>

                        {/* HISTORIAL RÁPIDO */}
                        {fotosHoy.length > 0 && (
                            <div className={styles.activityHoy}>
                                <Text variant="mediumPlus" className={styles.sectionLabel}>Tu actividad de hoy</Text>
                                <div className={styles.horizontalScroll}>
                                    {fotosHoy.map((f, i) => (
                                        <div key={i} className={styles.miniCard}>
                                            <img src={f.UrlFoto?.Url} alt="Hoy" />
                                            <div className={styles.miniCardOverlay}>{f.Title}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.gridObras}>
                            {data.obras.map((o) => {
                                const asignada = esObraAsignada(o.Id);
                                return (
                                    <button 
                                        key={o.Id} 
                                        className={`${styles.cardObra} ${asignada ? styles.asignada : ""}`}
                                        onClick={() => { setObraSeleccionada(o); setPaso(3); }}
                                    >
                                        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                                            <Stack>
                                                <Text className={styles.obraTitle}>{o.Title}</Text>
                                                <Text className={styles.obraSub}>{o.DireccionObra || "Sin dirección"}</Text>
                                            </Stack>
                                            {asignada && <Icon iconName="FavoriteStarFill" className={styles.starIcon} />}
                                        </Stack>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* PASO 3: CAPTURA Y ENVÍO */}
                {paso === 3 && (
                    <section className={styles.fadein}>
                        <div className={styles.sectionHeader}>
                            <IconButton iconProps={{iconName: 'Back'}} onClick={() => setPaso(2)} />
                            <Text variant="xxLarge" className={styles.stepTitle}>Captura de Progreso</Text>
                        </div>

                        <div className={styles.workCard}>
                            <Stack tokens={{childrenGap: 10}}>
                                <Text variant="large" style={{fontWeight: 600, color: '#004a99'}}>
                                    Obra: {obraSeleccionada?.Title}
                                </Text>
                                <Separator />
                                
                                <div className={styles.cameraBox}>
                                    <input type="file" accept="image/*" multiple id="camera-input" style={{ display: "none" }} onChange={handleFileChange} />
                                    <div className={styles.dropZone} onClick={() => document.getElementById("camera-input")?.click()}>
                                        <Icon iconName="Camera" className={styles.bigIcon} />
                                        <Text variant="large">Tocar para añadir fotos</Text>
                                        <Text variant="small">Máximo 5 fotos por reporte</Text>
                                    </div>
                                </div>

                                <div className={styles.previewContainer}>
                                    {fotos.map((f, i) => (
                                        <div key={i} className={styles.previewItem}>
                                            <img src={URL.createObjectURL(f)} />
                                            <IconButton iconProps={{iconName: 'Cancel'}} className={styles.removePhoto} onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))} />
                                        </div>
                                    ))}
                                </div>

                                <TextField
                                    label="Observaciones"
                                    multiline rows={3}
                                    value={comentarios}
                                    onChange={(_, v) => setComentarios(v || "")}
                                    placeholder="¿Alguna novedad importante?"
                                />

                                <PrimaryButton 
                                    text="Enviar Reporte a Oficina" 
                                    iconProps={{iconName: 'Send'}} 
                                    onClick={enviarReporte}
                                    disabled={fotos.length === 0 || subiendo}
                                    className={styles.sendButton}
                                />
                                {subiendo && <Spinner size={SpinnerSize.medium} label="Sincronizando con SharePoint..." />}
                            </Stack>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};