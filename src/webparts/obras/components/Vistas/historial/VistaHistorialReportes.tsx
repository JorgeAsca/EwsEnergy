import * as React from 'react';
import { Stack, Text, SearchBox, Spinner, Icon, Image, ImageFit } from '@fluentui/react';
import { DailyReportService } from '../../../service/DailyReportService';
import styles from './VistaHistorialTarjetas.module.scss';

export const VistaHistorialTarjetas: React.FC<{ context: any }> = (props) => {
    const [reportes, setReportes] = React.useState<any[]>([]);
    const [filtrados, setFiltrados] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const service = React.useMemo(() => new DailyReportService(props.context), [props.context]);

    const cargarDatos = async () => {
        setLoading(true);
        const data = await service.getHistorialGlobal();
        setReportes(data);
        setFiltrados(data);
        setLoading(false);
    };

    React.useEffect(() => { cargarDatos(); }, []);

    const onFilter = (text: string) => {
        const busqueda = text.toLowerCase();
        const filtrado = reportes.filter(r => 
            r.Title.toLowerCase().indexOf(busqueda) > -1 || 
            (r.Comentarios && r.Comentarios.toLowerCase().indexOf(busqueda) > -1)
        );
        setFiltrados(filtrado);
    };

    if (loading) return <Spinner label="Cargando historial..." />;

    return (
        <div className={styles.container}>
            <Stack tokens={{ childrenGap: 20 }}>
                <Text variant="xxLarge" className={styles.titulo}>📸 Galería de Reportes Diarios</Text>
                
                <SearchBox 
                    placeholder="Buscar por obra o descripción..." 
                    onChange={(_, val) => onFilter(val || "")} 
                />

                <div className={styles.cardGrid}>
                    {filtrados.map((item, idx) => (
                        <div key={idx} className={styles.reporteCard}>
                            <div className={styles.cardHeader}>
                                <Text variant="large" className={styles.obraName}>{item.Title}</Text>
                                <Text variant="small">{new Date(item.FechaRegistro).toLocaleDateString()}</Text>
                            </div>
                            
                            <div className={styles.imageContainer}>
                                <Image 
                                    src={item.UrlFoto?.Url} 
                                    alt="Foto reporte" 
                                    height={150} 
                                    imageFit={ImageFit.cover} 
                                />
                            </div>

                            <div className={styles.cardContent}>
                                <Text className={styles.comentarios}>{item.Comentarios || "Sin comentarios"}</Text>
                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }} style={{ marginTop: 10 }}>
                                    <Icon iconName="Contact" />
                                    <Text variant="small">ID Operario: {item.OperarioId}</Text>
                                </Stack>
                            </div>
                        </div>
                    ))}
                </div>
            </Stack>
        </div>
    );
};