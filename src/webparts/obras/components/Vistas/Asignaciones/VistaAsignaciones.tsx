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
            const [o, p, a]: [IObra[], IPersonal[], IAsignacion[]] =
                await Promise.all([
                    services.obras.getObras(),
                    services.personal.getPersonal(),
                    services.asignaciones.getAsignaciones() as any,
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
            const payload: IAsignacion = {
                ObraId: seleccion.obraId,
                PersonalId: seleccion.personalId,
                FechaInicio: new Date(),
                FechaFinPrevista: seleccion.fechaFin,
                EstadoProgreso: 0,
            };

            await services.asignaciones.asignarPersonal(payload);
            setSeleccion({ ...seleccion, obraId: 0, personalId: 0, fechaFin: new Date() });
            await cargarTodo();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEliminar = async (id: number) => {
        if (!window.confirm("¿Estás seguro de eliminar esta asignación?")) return;
        try {
            await services.asignaciones.eliminarAsignacion(id);
            await cargarTodo();
        } catch (e) {
            alert("Error al eliminar.");
        }
    };

    const getSemaforoInfo = (fechaFin: Date | string) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const difDias = (fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24);

        if (hoy > fin) return { clase: styles.retrasado, label: "Plazo Vencido" };
        if (difDias < 7) return { clase: styles.critico, label: "Entrega Próxima" };
        return { clase: styles.atiempo, label: "En Tiempo" };
    };

    if (loading) return <Spinner label="Cargando logística EWS..." className={styles.loader} />;

    return (
        <div className={styles.container}>
            <div className={styles.headerArea}>
                <Text className={styles.header}>📅 Panel de Asignaciones</Text>
            </div>

            <div className={styles.formContainer}>
                <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 20 }} wrap>
                    <div className={styles.fieldWrapper}>
                        <Dropdown
                            label="Obra"
                            selectedKey={seleccion.obraId}
                            options={obras.map((o) => ({ key: o.Id, text: o.Title }))}
                            onChange={(_, opt) => setSeleccion({ ...seleccion, obraId: opt?.key as number })}
                            className={styles.dropdownLarge}
                        />
                    </div>
                    <div className={styles.fieldWrapper}>
                        <Dropdown
                            label="Trabajador"
                            selectedKey={seleccion.personalId}
                            options={personal.map((p) => ({ key: p.Id, text: p.NombreyApellido }))}
                            onChange={(_, opt) => setSeleccion({ ...seleccion, personalId: opt?.key as number })}
                            className={styles.dropdownLarge}
                        />
                    </div>
                    <div className={styles.fieldWrapper}>
                        <DatePicker
                            label="Fecha límite"
                            value={seleccion.fechaFin}
                            onSelectDate={(date) => setSeleccion({ ...seleccion, fechaFin: date || new Date() })}
                            className={styles.datePicker}
                        />
                    </div>
                    <PrimaryButton
                        text="Asignar"
                        onClick={handleAsignar}
                        iconProps={{ iconName: "AddLink" }}
                        className={styles.btnAsignar}
                    />
                </Stack>
            </div>

            {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

            <div className={styles.grid}>
                {obras.map((obra) => {
                    const equipo = asignaciones.filter((a) => Number(a.ObraId) === Number(obra.Id));
                    const esFinalizada = obra.EstadoObra === "Finalizado";

                    return (
                        <div key={obra.Id} className={styles.obraCard}>
                            <Stack tokens={{ childrenGap: 15 }}>
                                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                                    <Text className={styles.obraTitle}>{obra.Title}</Text>
                                    <div className={`${styles.statusBadge} ${esFinalizada ? styles.bgFinalizado : styles.bgActivo}`}>
                                        {obra.EstadoObra || "En Curso"}
                                    </div>
                                </Stack>
                                <Separator />
                                <Stack tokens={{ childrenGap: 12 }}>
                                    {equipo.length > 0 ? (
                                        equipo.map((asig) => {
                                            const p = personal.find((pers) => Number(pers.Id) === Number(asig.PersonalId));
                                            const semaforo = getSemaforoInfo(asig.FechaFinPrevista);
                                            return (
                                                <div key={asig.Id} className={`${styles.assignmentItem} ${semaforo.clase}`}>
                                                    <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                                                        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                                                            <Persona
                                                                text={p?.NombreyApellido || "Desconocido"}
                                                                size={PersonaSize.size32}
                                                            />
                                                            <Stack>
                                                                <Text className={styles.personaName}>{p?.NombreyApellido}</Text>
                                                                <Text className={styles.semaforoText}>{semaforo.label}</Text>
                                                            </Stack>
                                                        </Stack>
                                                        <IconButton
                                                            iconProps={{ iconName: "Cancel" }}
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleEliminar(asig.Id!)}
                                                        />
                                                    </Stack>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <Text className={styles.emptyText}>Sin personal asignado actualmente</Text>
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