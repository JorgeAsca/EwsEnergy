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

    const [operario, setOperario] = React.useState<IPersonal | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = React.useState<IObra | null>(
        null,
    );
    const [compañeros, setCompañeros] = React.useState<IPersonal[]>([]);
    const [equipoConfirmado, setEquipoConfirmado] = React.useState<number[]>([]);

    // El progreso guarda directamente el porcentaje reportado (100, 60, 40, 0)
    const [progresoDia, setProgresoDia] = React.useState<number | null>(null);
    const [fotos, setFotos] = React.useState<File[]>([]);
    const [comentarios, setComentarios] = React.useState("");

    const [listaPersonal, setListaPersonal] = React.useState<IPersonal[]>([]);
    const [obrasActivas, setObrasActivas] = React.useState<IObra[]>([]);
    const [asignacionesGlobales, setAsignacionesGlobales] = React.useState<any[]>(
        [],
    );

    const services = React.useMemo(
        () => ({
            personal: new PersonalService(props.context),
            asig: new AsignacionesService(props.context),
            obras: new ProjectService(props.context),
            fotos: new PhotoService(props.context),
        }),
        [props.context],
    );

    React.useEffect(() => {
        const iniciar = async () => {
            try {
                const [pers, asigs, obs] = await Promise.all([
                    services.personal.getPersonal(),
                    services.asig.getAsignaciones(),
                    services.obras.getObras(),
                ]);
                setListaPersonal(pers);
                setAsignacionesGlobales(asigs);
                setObrasActivas(obs.filter((o) => o.EstadoObra !== "Finalizado"));
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
        const asigsObra = asignacionesGlobales.filter(
            (a) => Number(a.ObraId) === Number(ob.Id),
        );
        const compis = listaPersonal.filter(
            (p) =>
                asigsObra.some((a) => Number(a.PersonalId) === Number(p.Id)) &&
                p.Id !== operario?.Id,
        );
        setCompañeros(compis);
        setEquipoConfirmado(compis.map((c) => c.Id as number));
        setPaso(2);
    };

    const toggleCompañero = (id: number) => {
        setEquipoConfirmado((prev) =>
            prev.indexOf(id) !== -1 ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const opcionesNoAsignados: IDropdownOption[] = listaPersonal
        .filter(
            (p) => p.Id !== operario?.Id && !compañeros.some((c) => c.Id === p.Id),
        )
        .map((p) => ({ key: p.Id as number, text: p.NombreyApellido }));

    const agregarCompañeroExtra = (event: any, option?: IDropdownOption) => {
        if (option) {
            const persona = listaPersonal.find((p) => p.Id === option.key);
            if (persona) {
                setCompañeros((prev) => [...prev, persona]);
                setEquipoConfirmado((prev) => [...prev, persona.Id as number]);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFotos((prev) => [...prev, ...filesArray].slice(0, 4));
        }
    };

    const enviarReporte = async () => {
        setSubiendo(true);
        try {
            if (!obraSeleccionada || !operario) throw new Error("Faltan datos");

            for (let i = 0; i < fotos.length; i++) {
                await services.fotos.subirFotoProyecto(
                    fotos[i],
                    obraSeleccionada.Title,
                    {
                        operario: operario.NombreyApellido,
                        operarioId: operario.Id as number,
                        obraId: obraSeleccionada.Id as number,
                        comentarios: comentarios,
                    },
                );
            }

            // LÓGICA DE JORNADAS FLEXIBLES
            const jornadasTotales =
                obraSeleccionada.JornadasTotales && obraSeleccionada.JornadasTotales > 0
                    ? obraSeleccionada.JornadasTotales
                    : 30; // Fallback de seguridad

            const pesoUnaJornada = 100 / jornadasTotales;
            const porcentajeRendido = progresoDia === null ? 0 : progresoDia;
            const incrementoAvance = (porcentajeRendido / 100) * pesoUnaJornada;

            const progresoAnterior = obraSeleccionada.ProgresoReal || 0;
            let nuevoProgresoReal = progresoAnterior + incrementoAvance;
            if (nuevoProgresoReal > 100) nuevoProgresoReal = 100;

            await services.obras.actualizarProgresoObra(
                obraSeleccionada.Id as number,
                parseFloat(nuevoProgresoReal.toFixed(2)),
            );

            alert("¡Reporte enviado con éxito a la oficina! Buen trabajo.");

            setPaso(1);
            setOperario(null);
            setObraSeleccionada(null);
            setFotos([]);
            setComentarios("");
            setProgresoDia(null);
            setEquipoConfirmado([]);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al sincronizar.");
        } finally {
            setSubiendo(false);
        }
    };

    if (loading)
        return (
            <Spinner
                size={SpinnerSize.large}
                label="Preparando cierre de jornada..."
            />
        );

    return (
        <div className={styles.container}>
            <header className={styles.appHeader}>
                <Stack>
                    <Text variant="xLarge" className={styles.title}>
                        EWS
                    </Text>
                    <Text className={styles.subtitle}>Reporte Diario de Avance</Text>
                </Stack>
                {operario && (
                    <Persona
                        imageUrl={operario.FotoPerfil}
                        size={PersonaSize.size32}
                        hidePersonaDetails
                    />
                )}
            </header>

            <div className={styles.wizardNav}>
                {[1, 2, 3, 4].map((p) => (
                    <div
                        key={p}
                        className={`${styles.dot} ${paso >= p ? styles.active : ""}`}
                    />
                ))}
            </div>

            <main className={styles.mainContent}>
                {paso === 1 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            1. Identificación
                        </Text>
                        {!operario ? (
                            <Stack tokens={{ childrenGap: 10 }}>
                                <Text>¿Quién está enviando el reporte de la cuadrilla?</Text>
                                {listaPersonal.map((p) => (
                                    <div
                                        key={p.Id}
                                        className={styles.userCard}
                                        onClick={() => setOperario(p)}
                                    >
                                        <Persona
                                            imageUrl={p.FotoPerfil}
                                            text={p.NombreyApellido}
                                            secondaryText={p.Rol}
                                            size={PersonaSize.size40}
                                        />
                                    </div>
                                ))}
                            </Stack>
                        ) : (
                            <Stack tokens={{ childrenGap: 15 }}>
                                <Text>
                                    Hola {operario.NombreyApellido}, ¿En qué obra trabajó tu
                                    equipo hoy?
                                </Text>
                                {obrasActivas.map((o) => (
                                    <div
                                        key={o.Id}
                                        className={styles.obraCard}
                                        onClick={() => handleSeleccionarObra(o)}
                                    >
                                        <Text className={styles.obraTitle}>{o.Title}</Text>
                                        <Text variant="small">
                                            <Icon iconName="MapPin" /> {o.DireccionObra}
                                        </Text>
                                    </div>
                                ))}
                                <DefaultButton
                                    text="Cambiar Operario"
                                    onClick={() => setOperario(null)}
                                />
                            </Stack>
                        )}
                    </section>
                )}

                {paso === 2 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            2. Confirmar Cuadrilla
                        </Text>
                        <Text className={styles.instruccion}>
                            El sistema previó este equipo. Desmarca a quien no haya asistido:
                        </Text>

                        <div className={styles.teamList}>
                            {compañeros.length > 0 ? (
                                compañeros.map((c) => (
                                    <div key={c.Id} className={styles.teamMemberItem}>
                                        <Persona
                                            imageUrl={c.FotoPerfil}
                                            text={c.NombreyApellido}
                                            size={PersonaSize.size32}
                                        />
                                        <Checkbox
                                            checked={equipoConfirmado.indexOf(c.Id as number) !== -1}
                                            onChange={() => toggleCompañero(c.Id as number)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <MessageBar>
                                    Trabajaste solo en esta obra según el sistema.
                                </MessageBar>
                            )}
                        </div>

                        <div className={styles.extraSection}>
                            <Dropdown
                                placeholder="+ Añadir personal imprevisto"
                                options={opcionesNoAsignados}
                                onChange={agregarCompañeroExtra}
                                selectedKey={null}
                            />
                        </div>

                        <Stack
                            horizontal
                            tokens={{ childrenGap: 10 }}
                            styles={{ root: { marginTop: 20 } }}
                        >
                            <DefaultButton text="Atrás" onClick={() => setPaso(1)} />
                            <PrimaryButton
                                text="Siguiente"
                                onClick={() => setPaso(3)}
                                className={styles.btnEws}
                            />
                        </Stack>
                    </section>
                )}

                {paso === 3 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            3. Avance de la Jornada
                        </Text>
                        <Text className={styles.instruccion}>
                            ¿Qué porcentaje de una jornada típica lograron completar hoy?
                        </Text>

                        <Stack
                            tokens={{ childrenGap: 15 }}
                            className={styles.progressContainer}
                        >
                            <button
                                className={`${styles.progressBtn} ${styles.btnVerde} ${progresoDia === 100 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(100)}
                            >
                                <Icon iconName="CompletedSolid" /> Jornada Óptima (100%)
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnAmarillo} ${progresoDia === 60 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(60)}
                            >
                                <Icon iconName="HalfAlpha" /> Avance Notable (60%)
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnNaranja} ${progresoDia === 40 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(40)}
                            >
                                <Icon iconName="Clock" /> Avance Menor (40%)
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnRojo} ${progresoDia === 0 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(0)}
                            >
                                <Icon iconName="StatusErrorFull" /> Obra Bloqueada (0%)
                            </button>
                        </Stack>

                        <Stack
                            horizontal
                            tokens={{ childrenGap: 10 }}
                            styles={{ root: { marginTop: 25 } }}
                        >
                            <DefaultButton text="Atrás" onClick={() => setPaso(2)} />
                            <PrimaryButton
                                text="Siguiente"
                                onClick={() => setPaso(4)}
                                disabled={progresoDia === null}
                                className={styles.btnEws}
                            />
                        </Stack>
                    </section>
                )}

                {paso === 4 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            4. Evidencia Visual
                        </Text>
                        <label className={styles.photoDropzone}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                style={{ display: "none" }}
                            />
                            <Icon iconName="Camera" className={styles.bigIcon} />
                            <Text>Toca para tomar foto o abrir galería</Text>
                        </label>
                        <div className={styles.previewContainer}>
                            {fotos.map((f, i) => (
                                <div key={i} className={styles.previewItem}>
                                    <img src={URL.createObjectURL(f)} alt="preview" />
                                    <IconButton
                                        iconProps={{ iconName: "Cancel" }}
                                        className={styles.removePhoto}
                                        onClick={() =>
                                            setFotos((prev) => prev.filter((_, idx) => idx !== i))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                        <TextField
                            label="Comentarios (Usa el micrófono de tu teclado 🎤)"
                            multiline
                            rows={3}
                            value={comentarios}
                            onChange={(_, v) => setComentarios(v || "")}
                            placeholder="Ej. Dejamos el cuadro principal montado..."
                        />
                        <Stack
                            horizontal
                            tokens={{ childrenGap: 10 }}
                            styles={{ root: { marginTop: 25 } }}
                        >
                            <DefaultButton
                                text="Atrás"
                                onClick={() => setPaso(3)}
                                disabled={subiendo}
                            />
                            <PrimaryButton
                                text={subiendo ? "Sincronizando..." : "Enviar Reporte Oficial"}
                                iconProps={{ iconName: "Send" }}
                                onClick={enviarReporte}
                                disabled={fotos.length === 0 || subiendo}
                                className={styles.btnEws}
                                style={{ flex: 1 }}
                            />
                        </Stack>
                    </section>
                )}
            </main>
        </div>
    );
};
