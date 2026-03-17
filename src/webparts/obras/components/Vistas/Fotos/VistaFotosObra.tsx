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
} from "@fluentui/react";

// Modelos e Interfaces
import { IPersonal } from "../../../models/IPersonal";
import { IAsignacion } from "../../../models/IAsignacion";
import { IObra } from "../../../models/IObra";

// Servicios
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { ProjectService } from "../../../service/ProjectService";
import { PhotoService } from "../../../service/PhotoService";

import styles from "./VistaFotosObra.module.scss";

export const VistaFotosObra: React.FC<{ context: any }> = (props) => {
    const [paso, setPaso] = React.useState(1);
    const [loading, setLoading] = React.useState(true);
    const [operario, setOperario] = React.useState<IPersonal | null>(null);

    // Tipado correcto para evitar errores en las líneas 50/63
    const [data, setData] = React.useState<{
        personal: IPersonal[];
        asignaciones: IAsignacion[];
        obras: IObra[];
    }>({
        personal: [],
        asignaciones: [],
        obras: [],
    });

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
        const init = async () => {
            try {
                setLoading(true);
                // Línea 50 corregida: Definimos los tipos de retorno
                const [p, a, o]: [IPersonal[], IAsignacion[], IObra[]] =
                    await Promise.all([
                        services.personal.getPersonal(),
                        services.asignaciones.getAsignaciones(),
                        services.proyectos.getObras(),
                    ]);
                setData({ personal: p || [], asignaciones: a || [], obras: o || [] });
            } catch (e) {
                console.error("Error inicializando vista:", e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Línea 63 corregida: Lógica de resaltado basada en PersonalId
    const esObraAsignada = (obraId: number): boolean => {
        if (!operario) return false;
        return data.asignaciones.some(
            (a) =>
                Number(a.PersonalId) === Number(operario.Id) &&
                Number(a.ObraId) === Number(obraId),
        );
    };

    if (loading)
        return (
            <Spinner
                size={SpinnerSize.large}
                label="Cargando sistema de furgoneta..."
            />
        );

    return (
        <div className={styles.container}>
            {paso === 1 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Text variant="xxLarge" className={styles.titulo}>
                        🚛 Control de Furgoneta
                    </Text>
                    <Text variant="large">
                        Selecciona tu perfil para iniciar el reporte:
                    </Text>
                    <div className={styles.gridPersonal}>
                        {data.personal.map((p) => (
                            <div
                                key={p.Id}
                                className={styles.personaCard}
                                onClick={() => {
                                    setOperario(p);
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

            {paso === 2 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Stack
                        horizontal
                        horizontalAlign="space-between"
                        verticalAlign="center"
                    >
                        <Text variant="xl">
                            Sesión: <b>{operario?.NombreyApellido}</b>
                        </Text>
                        <DefaultButton
                            text="Cerrar Sesión"
                            onClick={() => {
                                setOperario(null);
                                setPaso(1);
                            }}
                        />
                    </Stack>

                    <Text variant="large">Selecciona la obra activa:</Text>

                    <div className={styles.listaObras}>
                        {data.obras.map((o) => {
                            const resaltada = esObraAsignada(Number(o.Id));
                            return (
                                <DefaultButton
                                    key={o.Id}
                                    className={`${styles.botonObra} ${resaltada ? styles.resaltada : ""}`}
                                    onClick={() => setPaso(3)}
                                >
                                    <Stack
                                        horizontal
                                        horizontalAlign="space-between"
                                        verticalAlign="center"
                                        style={{ width: "100%" }}
                                    >
                                        <Text variant="large">
                                            {resaltada ? "⭐ " : ""}
                                            {o.NombreObra || o.Title}
                                        </Text>
                                        {resaltada && (
                                            <span className={styles.badgeAsignada}>
                                                Asignada a esta furgoneta
                                            </span>
                                        )}
                                    </Stack>
                                </DefaultButton>
                            );
                        })}
                    </div>
                </Stack>
            )}

            {paso === 3 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <MessageBar messageBarType={MessageBarType.success}>
                        Obra seleccionada. Preparando cámara...
                    </MessageBar>
                    <PrimaryButton
                        text="Volver a lista de obras"
                        onClick={() => setPaso(2)}
                    />
                </Stack>
            )}
        </div>
    );
};
