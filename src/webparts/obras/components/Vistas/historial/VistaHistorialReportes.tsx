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

    if (loading) return <Spinner label="Consultando archivos EWS..." className={styles.loader} />;

    return (
        <div className={styles.container}>
            <Stack tokens={{ childrenGap: 25 }}>
                <div className={styles.headerSection}>
                    <Stack>
                        <Text variant="xxLarge" className={styles.titulo}>Historial de Evidencias</Text>
                        <Text variant="small" className={styles.subtitulo}>Registro fotográfico de operaciones en campo</Text>
                    </Stack>
                    <SearchBox 
                        placeholder="Buscar por obra o comentario..." 
                        onSearch={onFilter} 
                        onChange={(_, val) => onFilter(val || "")}
                        className={styles.searchBar}
                    />
                </div>

                <div className={styles.cardGrid}>
                    {filtrados.map((item, idx) => (
                        <div key={idx} className={styles.reporteCard}>
                            <div className={styles.cardHeader}>
                                <Text className={styles.obraName}>{item.Title}</Text>
                                <Text className={styles.fechaText}>{new Date(item.FechaRegistro).toLocaleDateString()}</Text>
                            </div>
                            
                            <div className={styles.imageContainer}>
                                <Image 
                                    src={item.UrlFoto?.Url} 
                                    alt="Foto reporte" 
                                    height={200} 
                                    imageFit={ImageFit.cover} 
                                    className={styles.reporteImagen}
                                />
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.comentarioBox}>
                                    <Text className={styles.comentarios}>
                                        {item.Comentarios ? `"${item.Comentarios}"` : "Sin observaciones técnicas"}
                                    </Text>
                                </div>
                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} className={styles.footerOperario}>
                                    <Icon iconName="Contact" className={styles.iconOperario} />
                                    <Text variant="small">ID Operario: <b>{item.OperarioId}</b></Text>
                                </Stack>
                            </div>
                        </div>
                    ))}
                </div>
            </Stack>
        </div>
    );
};