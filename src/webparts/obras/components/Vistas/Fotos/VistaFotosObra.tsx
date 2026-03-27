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
    Checkbox,
    IconButton,
    Dropdown,
    IDropdownOption,
} from "@fluentui/react";
import { IPersonal } from "../../../models/IPersonal";
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

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [mensajeExito, setMensajeExito] = React.useState(false);
    const [procesandoCaptura, setProcesandoCaptura] = React.useState(false);

    const [operario, setOperario] = React.useState<IPersonal | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = React.useState<IObra | null>(null);
    const [compañeros, setCompañeros] = React.useState<IPersonal[]>([]);
    const [equipoConfirmado, setEquipoConfirmado] = React.useState<number[]>([]);

    const [progresoDia, setProgresoDia] = React.useState<number | null>(null);
    const [fotos, setFotos] = React.useState<any[]>([]);
    const [comentarios, setComentarios] = React.useState("");

    const [data, setData] = React.useState({
        listaPersonal: [] as IPersonal[],
        obrasActivas: [] as IObra[],
        asignacionesGlobales: [] as any[]
    });

    const services = React.useMemo(() => ({
        personal: new PersonalService(props.context),
        asig: new AsignacionesService(props.context),
        obras: new ProjectService(props.context),
        fotos: new PhotoService(props.context),
    }), [props.context]);

    React.useEffect(() => {
        const iniciar = async () => {
            try {
                const [pers, asigs, obs] = await Promise.all([
                    services.personal.getPersonal(),
                    services.asig.getAsignaciones(),
                    services.obras.getObras(),
                ]);
                setData({
                    listaPersonal: pers,
                    asignacionesGlobales: asigs,
                    obrasActivas: obs.filter((o) => o.EstadoObra !== "Finalizado")
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        iniciar();
    }, [services]);

    const handleSeleccionarObra = (ob: IObra) => {
        setObraSeleccionada(ob);
        const asigsObra = data.asignacionesGlobales.filter(a => Number(a.ObraId) === Number(ob.Id));
        const compis = data.listaPersonal.filter(p => 
            asigsObra.some(a => Number(a.PersonalId) === Number(p.Id)) && p.Id !== operario?.Id
        );
        setCompañeros(compis);
        setEquipoConfirmado(compis.map(c => c.Id as number));
        setPaso(2);
    };

    const toggleCompañero = (id: number) => {
        setEquipoConfirmado((prev) => 
            prev.indexOf(id) !== -1 ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const agregarCompañeroExtra = (event: any, option?: IDropdownOption) => {
        if (option) {
            const persona = data.listaPersonal.find(p => p.Id === option.key);
            if (persona) {
                setCompañeros(prev => [...prev, persona]);
                setEquipoConfirmado(prev => [...prev, persona.Id as number]);
            }
        }
    };

    const manejarCapturaFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = event.target.files?.[0];
        if (!archivo) return;

        setProcesandoCaptura(true);
        setMensajeExito(false);

        try {
            const ubicacion = await obtenerUbicacion();
            // Aquí se mantiene tu lógica de previsualización optimizada
            const nuevaFotoLocal = {
                ID: Date.now(),
                archivo: archivo,
                Url: URL.createObjectURL(archivo),
                Nombre: archivo.name,
                latitud: ubicacion?.lat,
                longitud: ubicacion?.lng,
                Ubicacion: ubicacion ? `${ubicacion.lat}, ${ubicacion.lng}` : "Capturada"
            };

            setFotos((prev) => [...prev, nuevaFotoLocal]);
            setMensajeExito(true);
            setTimeout(() => setMensajeExito(false), 3000);
        } catch (error) {
            console.error("Error en vista previa:", error);
        } finally {
            setProcesandoCaptura(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const obtenerUbicacion = (): Promise<{ lat: number; lng: number } | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) resolve(null);
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve(null),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });
    };

    const enviarReporte = async () => {
        if (!obraSeleccionada || !operario || fotos.length === 0) return;

        setSubiendo(true);
        try {
            for (const fotoObj of fotos) {
                // Se usa el servicio que ya realiza la compresión interna antes de subir
                await services.fotos.uploadCompressedPhoto(fotoObj.archivo, obraSeleccionada.Title, {
                    operario: operario.NombreyApellido,
                    operarioId: operario.Id as number,
                    obraId: obraSeleccionada.Id as number,
                    comentarios: comentarios,
                    latitud: fotoObj.latitud,
                    longitud: fotoObj.longitud
                });
            }

            const jornadasTotales = obraSeleccionada.JornadasTotales || 30;
            const incrementoAvance = ((progresoDia || 0) / 100) * (100 / jornadasTotales);
            const nuevoProgresoReal = Math.min((obraSeleccionada.ProgresoReal || 0) + incrementoAvance, 100);

            await services.obras.actualizarProgresoObra(obraSeleccionada.Id as number, parseFloat(nuevoProgresoReal.toFixed(2)));

            alert("¡Reporte y fotos sincronizados con éxito!");
            window.location.reload();
        } catch (error) {
            alert("Hubo un error al sincronizar el reporte completo.");
        } finally {
            setSubiendo(false);
        }
    };

    if (loading) return <Spinner size={SpinnerSize.large} label="Preparando cierre de jornada..." />;

    return (
        <div className={styles.container}>
            <header className={styles.appHeader}>
                <Stack>
                    <Text variant="xLarge" className={styles.title}>EWS</Text>
                    <Text className={styles.subtitle}>Reporte Diario de Avance</Text>
                </Stack>
                {operario && <Persona imageUrl={operario.FotoPerfil} size={PersonaSize.size32} hidePersonaDetails />}
            </header>

            <div className={styles.wizardNav}>
                {[1, 2, 3, 4].map((p) => (
                    <div key={p} className={`${styles.dot} ${paso >= p ? styles.active : ""}`} />
                ))}
            </div>

            <main className={styles.mainContent}>
                {paso === 1 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>1. Identificación</Text>
                        {!operario ? (
                            <Stack tokens={{ childrenGap: 10 }}>
                                <Text>¿Quién envía el reporte?</Text>
                                {data.listaPersonal.map((p) => (
                                    <div key={p.Id} className={styles.userCard} onClick={() => setOperario(p)}>
                                        <Persona imageUrl={p.FotoPerfil} text={p.NombreyApellido} secondaryText={p.Rol} size={PersonaSize.size40} />
                                    </div>
                                ))}
                            </Stack>
                        ) : (
                            <Stack tokens={{ childrenGap: 15 }}>
                                <Text>Hola {operario.NombreyApellido}, ¿En qué obra trabajaste hoy?</Text>
                                {data.obrasActivas.map((o) => (
                                    <div key={o.Id} className={styles.obraCard} onClick={() => handleSeleccionarObra(o)}>
                                        <Text className={styles.obraTitle}>{o.Title}</Text>
                                        <Text variant="small"><Icon iconName="MapPin" /> {o.DireccionObra}</Text>
                                    </div>
                                ))}
                                <DefaultButton text="Cambiar Operario" onClick={() => setOperario(null)} />
                            </Stack>
                        )}
                    </section>
                )}

                {paso === 2 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>2. Confirmar Cuadrilla</Text>
                        <div className={styles.teamList}>
                            {compañeros.length > 0 ? compañeros.map((c) => (
                                <div key={c.Id} className={styles.teamMemberItem}>
                                    <Persona imageUrl={c.FotoPerfil} text={c.NombreyApellido} size={PersonaSize.size32} />
                                    <Checkbox 
                                        checked={equipoConfirmado.indexOf(c.Id as number) !== -1} 
                                        onChange={() => toggleCompañero(c.Id as number)} 
                                    />
                                </div>
                            )) : <MessageBar>Trabajaste solo en esta obra.</MessageBar>}
                        </div>
                        <div className={styles.extraSection}>
                            <Dropdown 
                                placeholder="+ Añadir personal imprevisto"
                                options={data.listaPersonal.filter(p => p.Id !== operario?.Id && !compañeros.some(c => c.Id === p.Id)).map(p => ({ key: p.Id as number, text: p.NombreyApellido }))}
                                onChange={agregarCompañeroExtra}
                                selectedKey={null}
                            />
                        </div>
                        <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: 20 } }}>
                            <DefaultButton text="Atrás" onClick={() => setPaso(1)} />
                            <PrimaryButton text="Siguiente" onClick={() => setPaso(3)} className={styles.btnEws} />
                        </Stack>
                    </section>
                )}

                {paso === 3 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>3. Avance de la Jornada</Text>
                        <Stack tokens={{ childrenGap: 15 }} className={styles.progressContainer}>
                            {[ {v:100, l:"Jornada Óptima (100%)", i:"CompletedSolid", s:styles.btnVerde}, {v:60, l:"Avance Notable (60%)", i:"HalfAlpha", s:styles.btnAmarillo}, {v:40, l:"Avance Menor (40%)", i:"Clock", s:styles.btnNaranja}, {v:0, l:"Obra Bloqueada (0%)", i:"StatusErrorFull", s:styles.btnRojo} ].map(btn => (
                                <button key={btn.v} className={`${styles.progressBtn} ${btn.s} ${progresoDia === btn.v ? styles.selected : ""}`} onClick={() => setProgresoDia(btn.v)}>
                                    <Icon iconName={btn.i} /> {btn.l}
                                </button>
                            ))}
                        </Stack>
                        <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: 25 } }}>
                            <DefaultButton text="Atrás" onClick={() => setPaso(2)} />
                            <PrimaryButton text="Siguiente" onClick={() => setPaso(4)} disabled={progresoDia === null} className={styles.btnEws} />
                        </Stack>
                    </section>
                )}

                {paso === 4 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>4. Evidencia Visual</Text>
                        <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} ref={fileInputRef} onChange={manejarCapturaFoto} />
                        
                        <label 
                            className={styles.photoDropzone} 
                            onClick={() => !procesandoCaptura && fileInputRef.current?.click()}
                            style={{ cursor: procesandoCaptura ? 'wait' : 'pointer', opacity: procesandoCaptura ? 0.7 : 1 }}
                        >
                            {procesandoCaptura ? (
                                <Spinner size={SpinnerSize.large} label="Optimizando..." />
                            ) : (
                                <><Icon iconName="Camera" className={styles.bigIcon} /><Text>Toca para tomar foto con GPS</Text></>
                            )}
                        </label>

                        {mensajeExito && (
                            <MessageBar messageBarType={MessageBarType.success} isMultiline={false} styles={{ root: { marginTop: 10 } }}>
                                Foto capturada y optimizada correctamente.
                            </MessageBar>
                        )}

                        <div className={styles.previewContainer}>
                            {fotos.map((f, i) => (
                                <div key={f.ID || i} className={styles.previewItem}>
                                    <img src={f.Url} alt="preview" />
                                    {f.latitud && <span className={styles.gpsBadge}><Icon iconName="MapPin" /></span>}
                                    <IconButton iconProps={{ iconName: "Cancel" }} className={styles.removePhoto} onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))} />
                                </div>
                            ))}
                        </div>

                        <TextField label="Comentarios 🎤" multiline rows={3} value={comentarios} onChange={(_, v) => setComentarios(v || "")} />

                        <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: 25 } }}>
                            <DefaultButton text="Atrás" onClick={() => setPaso(3)} disabled={subiendo || procesandoCaptura} />
                            <PrimaryButton text={subiendo ? "Sincronizando..." : "Enviar Reporte"} iconProps={{ iconName: "Send" }} onClick={enviarReporte} disabled={fotos.length === 0 || subiendo || procesandoCaptura} className={styles.btnEws} style={{ flex: 1 }} />
                        </Stack>
                    </section>
                )}
            </main>
        </div>
    );
};