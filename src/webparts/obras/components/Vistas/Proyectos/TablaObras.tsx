import * as React from 'react';
import { 
    Stack, Text, PrimaryButton, Panel, TextField, 
    DatePicker, Dropdown, IDropdownOption, Spinner,
    DefaultButton
} from '@fluentui/react';
import { SPHttpClient } from '@microsoft/sp-http';
import { ProjectService } from '../../../service/ProjectService';
import { IObra } from '../../../models/IObra';
import styles from './TablaObras.module.scss'; // IMPORTANTE

export const TablaObras: React.FC<{ context: any }> = (props) => {
    const [obras, setObras] = React.useState<IObra[]>([]);
    const [clientes, setClientes] = React.useState<IDropdownOption[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [nuevaObra, setNuevaObra] = React.useState({
        Nombre: '',
        Descripcion: '',
        ClienteId: 0,
        Direccion: '',
        FechaInicio: new Date(),
        FechaFin: new Date()
    });

    const projectService = React.useMemo(() => new ProjectService(props.context), [props.context]);

    const cargarDatos = async () => {
        try {
            const listaObras = await projectService.getObras();
            setObras(listaObras);

            // Carga de clientes corregida
            const resp = await props.context.spHttpClient.get(
                `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Clientes')/items`,
                SPHttpClient.configurations.v1
            );
            const data = await resp.json();
            const opciones = data.value.map((c: any) => ({ key: c.Id, text: c.Title }));
            setClientes(opciones);
        } catch (e) {
            console.error("Error cargando datos:", e);
        }
    };

    React.useEffect(() => {
        cargarDatos().catch(console.error);
    }, []);

    const handleGuardar = async () => {
        try {
            setLoading(true);
            await projectService.crearObra(nuevaObra);
            setIsOpen(false);
            // Reset del formulario
            setNuevaObra({ 
                Nombre: '', Descripcion: '', ClienteId: 0, 
                Direccion: '', FechaInicio: new Date(), FechaFin: new Date() 
            });
            await cargarDatos();
        } catch (e) {
            alert("Error al guardar la obra.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Text variant="xxLarge">Proyectos en Curso</Text>
                <PrimaryButton 
                    iconProps={{ iconName: 'Add' }} 
                    text="Nueva Obra" 
                    onClick={() => setIsOpen(true)} 
                />
            </Stack>

            {/* Renderizado de la tabla u otros componentes aquí */}

            <Panel
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                headerText="Nuevo Proyecto"
            >
                {/* Contenido del formulario que definimos antes */}
            </Panel>
        </div>
    );
};