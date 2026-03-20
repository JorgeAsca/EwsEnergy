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
    IDropdownOption, // <-- Añadido Dropdown
} from "@fluentui/react";
import { IPersonal } from "../../../models/IPersonal";
import { IObra } from "../../../models/IObra";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { ProjectService } from "../../../service/ProjectService";
import { PhotoService } from "../../../service/PhotoService";
import styles from "./VistaFotosObra.module.scss";

// --- FUNCIÓN MATEMÁTICA ---
const calcularDiasLaborables = (fechaInicio: Date, fechaFin: Date): number => {
    if (fechaInicio > fechaFin) return 0;
    let count = 0;
    let curDate = new Date(fechaInicio.getTime());
    curDate.setHours(0, 0, 0, 0);
    const endDate = new Date(fechaFin.getTime());
    endDate.setHours(0, 0, 0, 0);

    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

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

    // Progreso ahora medirá HORAS (5, 2.5, 1, 0)
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

    // --- NUEVO: Añadir personal imprevisto a la lista del día ---
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

            // 1. Subida de fotos e historial
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

            // 2. CÁLCULO DE AVANCE WRENCH TIME (Rendimiento por Cuadrilla)
            const inicioDate = new Date(obraSeleccionada.FechaInicio || Date.now());
            const finDate = new Date(
                obraSeleccionada.FechaFinPrevista ||
                Date.now() + 30 * 24 * 60 * 60 * 1000,
            );
            const diasLaborables = Math.max(
                1,
                calcularDiasLaborables(inicioDate, finDate),
            );
            const pesoDiario = 100 / diasLaborables;

            // Constante: 5 horas efectivas equivalen al 100% del día
            const HORAS_OPTIMAS_DIARIAS = 5;
            const horasReportadas = progresoDia === null ? 0 : progresoDia;

            // Si hacen 5h = Factor 1. Si hacen 2.5h = Factor 0.5
            const factorRendimiento = horasReportadas / HORAS_OPTIMAS_DIARIAS;
            const incrementoAvance = pesoDiario * Math.min(factorRendimiento, 1);

            const progresoAnterior = obraSeleccionada.ProgresoReal || 0;
            let nuevoProgresoReal = progresoAnterior + incrementoAvance;
            if (nuevoProgresoReal > 100) nuevoProgresoReal = 100;

            // 3. Actualizar la obra en SharePoint
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

                        {/* DESPLEGABLE DE IMPREVISTOS */}
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
                            3. Rendimiento de Cuadrilla
                        </Text>
                        <Text className={styles.instruccion}>
                            ¿Cuántas horas de instalación / montaje EFECTIVAS logró el equipo
                            hoy?
                        </Text>

                        {/* NUEVOS BOTONES DE HORAS (Wrench Time) */}
                        <Stack
                            tokens={{ childrenGap: 15 }}
                            className={styles.progressContainer}
                        >
                            <button
                                className={`${styles.progressBtn} ${styles.btnVerde} ${progresoDia === 5 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(5)}
                            >
                                <Icon iconName="CompletedSolid" /> Jornada Completa (~5h o más)
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnAmarillo} ${progresoDia === 2.5 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(2.5)}
                            >
                                <Icon iconName="HalfAlpha" /> Media Jornada (~2.5h a 3h)
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnNaranja} ${progresoDia === 1 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(1)}
                            >
                                <Icon iconName="Clock" /> Intervención Corta (~1h)
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnRojo} ${progresoDia === 0 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(0)}
                            >
                                <Icon iconName="StatusErrorFull" /> Obra Bloqueada (0h)
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
