import * as React from "react";
import {
    Stack, Text, Persona, PersonaSize, PrimaryButton, DefaultButton,
    Spinner, SpinnerSize, MessageBar, MessageBarType
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
    const [operario, setOperario] = React.useState<IPersonal | null>(null);
    const [obraSeleccionada, setObraSeleccionada] = React.useState<IObra | null>(null);

    const [data, setData] = React.useState<{
        personal: IPersonal[];
        asignaciones: IAsignacion[];
        obras: IObra[];
    }>({
        personal: [],
        asignaciones: [],
        obras: []
    });

    const services = React.useMemo(() => ({
        personal: new PersonalService(props.context),
        asignaciones: new AsignacionesService(props.context),
        proyectos: new ProjectService(props.context),
        photos: new PhotoService(props.context)
    }), [props.context]);

    React.useEffect(() => {
        const init = async (): Promise<void> => {
            try {
                setLoading(true);

                
                const [p, a, o] = await Promise.all([
                    services.personal.getPersonal(),
                    services.asignaciones.getAsignaciones(),
                    services.proyectos.getObras()
                ]);

                
                setData({
                    personal: p || [],
                    asignaciones: a || [],
                    obras: o || []
                });

            } catch (e) {
                console.error("Error inicializando vista:", e);
            } finally {
                setLoading(false);
            }
        };
        init().catch(err => console.error(err));
    }, [services]);

    const esObraAsignada = (obraId: number | undefined): boolean => {
        if (!operario || !obraId) return false;
        return data.asignaciones.some(asign =>
            Number(asign.PersonalId) === Number(operario.Id) &&
            Number(asign.ObraId) === Number(obraId)
        );
    };

    if (loading) return <Spinner size={SpinnerSize.large} label="Cargando sistema furgoneta..." />;

    return (
        <div className={styles.container}>
            {paso === 1 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Text variant="xxLarge" className={styles.titulo}>🚛 Reporte de Furgoneta</Text>
                    <Text variant="large">Selecciona tu perfil:</Text>
                    <div className={styles.gridPersonal}>
                        {data.personal.map((p) => (
                            <div key={p.Id} className={styles.personaCard} onClick={() => { setOperario(p); setPaso(2); }}>
                                <Persona text={p.NombreyApellido} imageUrl={p.FotoPerfil} size={PersonaSize.size72} />
                            </div>
                        ))}
                    </div>
                </Stack>
            )}

            {paso === 2 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                        {/* SOLUCIÓN LÍNEA 99: Acceso seguro al operario */}
                        <Text variant="xLarge">Sesión de: <b>{operario ? operario.NombreyApellido : ""}</b></Text>
                        <DefaultButton text="Cambiar usuario" onClick={() => { setOperario(null); setPaso(1); }} />
                    </Stack>

                    <div className={styles.listaObras}>
                        {data.obras.map((o) => {
                            const resaltada = esObraAsignada(o.Id);
                            return (
                                <DefaultButton
                                    key={o.Id}
                                    className={`${styles.botonObra} ${resaltada ? styles.resaltada : ""}`}
                                    onClick={() => { setObraSeleccionada(o); setPaso(3); }}
                                >
                                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center" style={{ width: "100%" }}>
                                        {/* SOLUCIÓN: Usamos .Title según tu interfaz IObra */}
                                        <Text variant="large">{resaltada ? "⭐ " : ""}{o.Title}</Text>
                                        {resaltada && <span className={styles.badgeAsignada}>OBRA ASIGNADA</span>}
                                    </Stack>
                                </DefaultButton>
                            );
                        })}
                    </div>
                </Stack>
            )}

            {paso === 3 && (
                <Stack tokens={{ childrenGap: 20 }}>
                    {/* SOLUCIÓN LÍNEA 127: Usamos .Title según tu interfaz IObra */}
                    <Text variant="xLarge">Cargando cámara para: {obraSeleccionada ? obraSeleccionada.Title : "Obra"}</Text>
                    <MessageBar messageBarType={MessageBarType.info}>
                        Preparando captura de fotos para {operario?.NombreyApellido}.
                    </MessageBar>
                    <PrimaryButton text="Volver a lista de obras" onClick={() => setPaso(2)} />
                </Stack>
            )}
        </div>
    );
};