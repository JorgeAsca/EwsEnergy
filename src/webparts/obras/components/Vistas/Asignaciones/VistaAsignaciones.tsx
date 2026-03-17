import * as React from "react";
import {
    Stack,
    Text,
    Persona,
    PersonaSize,
    Dropdown,
    PrimaryButton,
    IconButton,
    Spinner,
    MessageBar,
    MessageBarType,
    DatePicker,
    Separator,
} from "@fluentui/react";
import { ProjectService } from "../../../service/ProjectService";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { IObra } from "../../../models/IObra";
import { IPersonal } from "../../../models/IPersonal";
import { IAsignacion } from "../../../models/IAsignacion";

import styles from "./VistaAsignaciones.module.scss";

export const VistaAsignaciones: React.FC<{ context: any }> = (props) => {
    const [obras, setObras] = React.useState<IObra[]>([]);
    const [personal, setPersonal] = React.useState<IPersonal[]>([]);
    const [asignaciones, setAsignaciones] = React.useState<IAsignacion[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [seleccion, setSeleccion] = React.useState({
        obraId: 0,
        personalId: 0,
        fechaFin: new Date(),
    });

    const services = React.useMemo(
        () => ({
            obras: new ProjectService(props.context),
            personal: new PersonalService(props.context),
            asignaciones: new AsignacionesService(props.context),
        }),
        [props.context],
    );

    const cargarTodo = async () => {
        try {
            setLoading(true);
            // Tipado explícito para asegurar compatibilidad con la interfaz que usa Date
            const [o, p, a]: [IObra[], IPersonal[], IAsignacion[]] = await Promise.all([
                services.obras.getObras(),
                services.personal.getPersonal(),
                services.asignaciones.getAsignaciones() as any, // Cast temporal para la conversión de tipos del servicio
            ]);
            setObras(o || []);
            setPersonal(p || []);
            setAsignaciones(a || []);
        } catch (e) {
            setError("Error al cargar datos.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        cargarTodo().catch(console.error);
    }, []);

    const handleAsignar = async () => {
        if (!seleccion.obraId || !seleccion.personalId) return;
        try {
            // Cumplimos con la interfaz IAsignacion enviando los campos requeridos
            await services.asignaciones.asignarPersonal({
                ObraId: seleccion.obraId,
                PersonalId: seleccion.personalId,
                FechaInicio: new Date(), // Enviamos objeto Date como pide tu interfaz
                FechaFinPrevista: seleccion.fechaFin,
                EstadoProgreso: 0 // Campo requerido en tu interfaz de modelos
            } as IAsignacion);
            
            setSeleccion({ ...seleccion, obraId: 0, personalId: 0, fechaFin: new Date() });
            await cargarTodo();
        } catch (e) {
            alert("Error al asignar.");
        }
    };

    const handleEliminar = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar esta asignación?")) return;
        try {
            await services.asignaciones.eliminarAsignacion(id);
            await cargarTodo();
        } catch (e) {
            alert("Error al eliminar la asignación.");
        }
    };

    const calcularSemaforo = (fechaFin: Date | string) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const difDias = (fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
        
        if (hoy > fin) return { color: "#d13438", label: "Retrasado" };
        if (difDias < 7) return { color: "#ffaa44", label: "Crítico" };
        return { color: "#107c10", label: "A tiempo" };
    };

    if (loading) return <Spinner label="Cargando sistema de asignaciones..." />;

    return (
        <div className={styles.container}>
            <Text className={styles.header}>📅 Panel de Asignaciones</Text>

            <div className={styles.formContainer}>
                <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 15 }} wrap>
                    <Dropdown
                        label="Obra"
                        selectedKey={seleccion.obraId}
                        options={obras.map((o) => ({ key: o.Id, text: o.Title }))}
                        onChange={(_, opt) =>
                            setSeleccion({ ...seleccion, obraId: opt?.key as number })
                        }
                        style={{ width: 250 }}
                    />
                    <Dropdown
                        label="Trabajador"
                        selectedKey={seleccion.personalId}
                        options={personal.map((p) => ({
                            key: p.Id,
                            text: p.NombreyApellido,
                        }))}
                        onChange={(_, opt) =>
                            setSeleccion({ ...seleccion, personalId: opt?.key as number })
                        }
                        style={{ width: 250 }}
                    />
                    <DatePicker
                        label="Fecha límite"
                        value={seleccion.fechaFin}
                        onSelectDate={(date) =>
                            setSeleccion({ ...seleccion, fechaFin: date || new Date() })
                        }
                    />
                    <PrimaryButton
                        text="Asignar"
                        onClick={handleAsignar}
                        iconProps={{ iconName: "AddLink" }}
                    />
                </Stack>
            </div>

            {error && (
                <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
            )}

            <div className={styles.grid}>
                {obras.map((obra) => {
                    // Filtrado seguro convirtiendo IDs a Number
                    const equipo = asignaciones.filter((a) => Number(a.ObraId) === Number(obra.Id));
                    // Uso de la propiedad correcta según IObra.ts
                    const esFinalizada = obra.EstadoObra === "Finalizado";

                    return (
                        <div key={obra.Id} className={styles.obraCard}>
                            <Stack tokens={{ childrenGap: 10 }}>
                                <Stack
                                    horizontal
                                    horizontalAlign="space-between"
                                    verticalAlign="center"
                                >
                                    <Text className={styles.obraTitle}>{obra.Title}</Text>
                                    <div
                                        className={styles.statusDot}
                                        style={{ background: esFinalizada ? "#107c10" : "#0078d4" }}
                                    />
                                </Stack>
                                <Separator />
                                <Stack tokens={{ childrenGap: 5 }}>
                                    {equipo.length > 0 ? (
                                        equipo.map((asig) => {
                                            const p = personal.find(
                                                (pers) => Number(pers.Id) === Number(asig.PersonalId),
                                            );
                                            const semaforo = calcularSemaforo(asig.FechaFinPrevista);
                                            return (
                                                <div
                                                    key={asig.Id}
                                                    className={styles.assignmentItem}
                                                    style={{ borderLeftColor: semaforo.color }}
                                                >
                                                    <Stack
                                                        horizontal
                                                        verticalAlign="center"
                                                        horizontalAlign="space-between"
                                                        style={{ width: "100%" }}
                                                    >
                                                        <Stack
                                                            horizontal
                                                            verticalAlign="center"
                                                            tokens={{ childrenGap: 8 }}
                                                        >
                                                            <Persona
                                                                text={p?.NombreyApellido || "Desconocido"}
                                                                size={PersonaSize.size24}
                                                            />
                                                            <Text
                                                                variant="tiny"
                                                                style={{
                                                                    color: semaforo.color,
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {semaforo.label}
                                                            </Text>
                                                        </Stack>
                                                        <IconButton
                                                            iconProps={{ iconName: "Delete" }}
                                                            title="Eliminar"
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleEliminar(asig.Id!)}
                                                        />
                                                    </Stack>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <Text className={styles.emptyText}>
                                            Sin personal asignado
                                        </Text>
                                    )}
                                </Stack>
                            </Stack>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};