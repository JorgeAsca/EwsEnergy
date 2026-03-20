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
} from "@fluentui/react";
import { IPersonal } from "../../../models/IPersonal";
import { IObra } from "../../../models/IObra";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { ProjectService } from "../../../service/ProjectService";
import styles from "./VistaFotosObra.module.scss";

export const VistaFotosObra: React.FC<{ context: any }> = (props) => {
    // ESTADOS DEL WIZARD (Asistente)
    const [paso, setPaso] = React.useState(1);
    const [loading, setLoading] = React.useState(true);
    const [subiendo, setSubiendo] = React.useState(false);

    // Paso 1: Identidad
    const [operario, setOperario] = React.useState<IPersonal | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = React.useState<IObra | null>(
        null,
    );

    // Paso 2: Equipo
    const [compañeros, setCompañeros] = React.useState<IPersonal[]>([]);
    const [equipoConfirmado, setEquipoConfirmado] = React.useState<number[]>([]);

    // Paso 3: Progreso
    const [progresoDia, setProgresoDia] = React.useState<number | null>(null); // 100, 50, 0

    // Paso 4: Evidencias
    const [fotos, setFotos] = React.useState<File[]>([]);
    const [comentarios, setComentarios] = React.useState("");

    // Datos Base
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
    }, []);

    // Cuando selecciona quién es y en qué obra está
    const handleSeleccionarObra = (ob: IObra) => {
        setObraSeleccionada(ob);

        // Buscar quién más está en esta obra hoy
        const asigsObra = asignacionesGlobales.filter(
            (a) => Number(a.ObraId) === Number(ob.Id),
        );
        const compis = listaPersonal.filter(
            (p) =>
                asigsObra.some((a) => Number(a.PersonalId) === Number(p.Id)) &&
                p.Id !== operario?.Id,
        );

        setCompañeros(compis);
        setEquipoConfirmado(compis.map((c) => c.Id)); // Pre-marcamos todos por defecto
        setPaso(2); // Avanzamos al paso de Equipo
    };

    const toggleCompañero = (id: number) => {
        setEquipoConfirmado((prev) =>
            prev.indexOf(id) !== -1 ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFotos((prev) => [...prev, ...filesArray].slice(0, 4)); // Máximo 4 fotos
        }
    };

    const enviarReporte = async () => {
        setSubiendo(true);
        try {
            // Aquí enviarás el payload a tu servicio (ej. DailyReportService)
            const reporte = {
                OperarioPrincipal: operario?.Id,
                ObraId: obraSeleccionada?.Id,
                EquipoConfirmado: equipoConfirmado,
                ProgresoReportado: progresoDia,
                Comentarios: comentarios,
                Fotos: fotos,
            };

            console.log("Reporte a enviar:", reporte);
            // Simulación de carga
            await new Promise((resolve) => setTimeout(resolve, 2000));

            alert("¡Reporte enviado con éxito! Buen trabajo equipo.");

            // Resetear para el día siguiente
            setPaso(1);
            setOperario(null);
            setObraSeleccionada(null);
            setFotos([]);
            setComentarios("");
            setProgresoDia(null);
        } catch (error) {
            alert("Error al sincronizar.");
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

            {/* BARRA DE PROGRESO DEL WIZARD */}
            <div className={styles.wizardNav}>
                {[1, 2, 3, 4].map((p) => (
                    <div
                        key={p}
                        className={`${styles.dot} ${paso >= p ? styles.active : ""}`}
                    />
                ))}
            </div>

            <main className={styles.mainContent}>
                {/* PASO 1: ¿Quién eres y dónde estás? */}
                {paso === 1 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            1. Identificación
                        </Text>
                        {!operario ? (
                            <Stack tokens={{ childrenGap: 10 }}>
                                <Text>¿Quién está enviando el reporte?</Text>
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
                                    Hola {operario.NombreyApellido}, ¿En qué obra trabajaste hoy?
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

                {/* PASO 2: Confirmar Equipo */}
                {paso === 2 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            2. Confirmar Equipo
                        </Text>
                        <Text className={styles.instruccion}>
                            El sistema previó que trabajarías con ellos hoy. Desmarca a quien
                            no haya asistido:
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
                                <MessageBar>Trabajaste solo en esta obra.</MessageBar>
                            )}
                        </div>

                        <Stack horizontal tokens={{ childrenGap: 10 }}>
                            <DefaultButton text="Atrás" onClick={() => setPaso(1)} />
                            <PrimaryButton
                                text="Siguiente"
                                onClick={() => setPaso(3)}
                                className={styles.btnEws}
                            />
                        </Stack>
                    </section>
                )}

                {/* PASO 3: Estado de la Obra (Botones Grandes) */}
                {paso === 3 && (
                    <section className={styles.stepContainer}>
                        <Text variant="large" className={styles.stepTitle}>
                            3. Rendimiento Diario
                        </Text>
                        <Text className={styles.instruccion}>
                            ¿Cómo fue el avance de la obra el día de hoy?
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
                                className={`${styles.progressBtn} ${styles.btnAmarillo} ${progresoDia === 50 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(50)}
                            >
                                <Icon iconName="WarningSolid" /> Retraso Leve / Faltó Material
                            </button>
                            <button
                                className={`${styles.progressBtn} ${styles.btnRojo} ${progresoDia === 0 ? styles.selected : ""}`}
                                onClick={() => setProgresoDia(0)}
                            >
                                <Icon iconName="StatusErrorFull" /> Obra Bloqueada / Problemas
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

                {/* PASO 4: Fotos y Dictado por voz */}
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
