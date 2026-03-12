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
import {
    AsignacionesService,
    IAsignacion,
} from "../../../service/AsignacionesService";
import { IObra } from "../../../models/IObra";
import { IPersonal } from "../../../models/IPersonal";

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
            const [o, p, a] = await Promise.all([
                services.obras.getObras(),
                services.personal.getPersonal(),
                services.asignaciones.getAsignaciones(),
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
        cargarTodo();
    }, []);

    const handleAsignar = async () => {
        if (!seleccion.obraId || !seleccion.personalId) return;
        try {
            await services.asignaciones.asignarPersonal({
                ObraId: seleccion.obraId,
                PersonalId: seleccion.personalId,
                FechaInicio: new Date().toISOString(),
                FechaFinPrevista: seleccion.fechaFin.toISOString(),
            });
            setSeleccion({ ...seleccion, obraId: 0, personalId: 0 });
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

    const calcularSemaforo = (fechaFinStr: string) => {
        const hoy = new Date();
        const fin = new Date(fechaFinStr);
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
                    const equipo = asignaciones.filter((a) => a.ObraId === obra.Id);
                    const esCompletada =
                        (obra as any).Estado === "Completada" ||
                        (obra as any).Status === "Completada";

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
                                        style={{ background: esCompletada ? "#107c10" : "#0078d4" }}
                                    />
                                </Stack>
                                <Separator />
                                <Stack tokens={{ childrenGap: 5 }}>
                                    {equipo.length > 0 ? (
                                        equipo.map((asig) => {
                                            const p = personal.find(
                                                (pers) => pers.Id === asig.PersonalId,
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
