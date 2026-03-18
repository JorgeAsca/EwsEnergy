import * as React from "react";
import {
  Stack, Text, Persona, PersonaSize, Spinner, SpinnerSize, MessageBar, 
  MessageBarType, PrimaryButton, DefaultButton, Panel, TextField, Dropdown, 
  IDropdownOption, Icon, Separator, PanelType, IconButton, Shimmer,
  ShimmerElementType, Dialog, DialogType, DialogFooter
} from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { IPersonal } from "../../../models/IPersonal";

import styles from "./GaleriaPersonal.module.scss";

const PersonaShimmer = () => (
  <div className={styles.cardEmpleado} style={{ cursor: 'default' }}>
    <Stack horizontalAlign="center" tokens={{ childrenGap: 15 }}>
      <Shimmer shimmerElements={[{ type: ShimmerElementType.circle, height: 100 }]} />
      <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 16, width: '80%' }]} />
      <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 12, width: '60%' }]} />
      <Separator styles={{ root: { margin: '15px 0', width: '100%' } }} />
      <Stack horizontal horizontalAlign="space-between" styles={{ root: { width: '100%' } }}>
        <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 10, width: '30%' }]} />
        <Shimmer shimmerElements={[{ type: ShimmerElementType.circle, height: 16 }]} />
      </Stack>
    </Stack>
  </div>
);

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [empleados, setEmpleados] = React.useState<IPersonal[]>([]);
  const [rolOptions, setRolOptions] = React.useState<IDropdownOption[]>([]);
  const [fotoOptions, setFotoOptions] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editandoId, setEditandoId] = React.useState<number | null>(null);
  
  // Estado para el diálogo de confirmación de borrado
  const [hideDeleteDialog, setHideDeleteDialog] = React.useState(true);

  const [formulario, setFormulario] = React.useState({
    NombreyApellido: "",
    Rol: "",
    FotoPerfil: "" 
  });

  const service = React.useMemo(() => new PersonalService(props.context), [props.context]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [data, opciones, fotos] = await Promise.all([
        service.getPersonal(),
        service.getRolOptions(),
        service.getFotosDisponibles()
      ]);
      setEmpleados(data || []);
      setRolOptions(opciones.map(opt => ({ key: opt, text: opt })));
      setFotoOptions(fotos.map(f => ({ key: f.url, text: f.text })));
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  React.useEffect(() => {
    cargarDatos().catch(console.error);
  }, []);

  const abrirEdicion = (emp: IPersonal) => {
    setEditandoId(emp.Id);
    setFormulario({
      NombreyApellido: emp.NombreyApellido,
      Rol: emp.Rol || (rolOptions[0]?.key as string) || "",
      FotoPerfil: emp.FotoPerfil || ""
    });
    setIsOpen(true);
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormulario({ NombreyApellido: "", Rol: (rolOptions[0]?.key as string) || "", FotoPerfil: "" });
    setIsOpen(true);
  };

  const handleGuardar = async () => {
    if (!formulario.NombreyApellido.trim()) return;
    try {
      setSaving(true);
      if (editandoId) {
        await service.actualizarTrabajador(editandoId, formulario);
      } else {
        await service.crearTrabajador(formulario);
      }
      setIsOpen(false);
      await cargarDatos();
    } catch (e) {
      console.error("Error al guardar:", e);
      alert("Error al guardar en SharePoint.");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!editandoId) return;
    try {
      setSaving(true);
      await service.eliminarTrabajador(editandoId);
      setHideDeleteDialog(true);
      setIsOpen(false);
      await cargarDatos();
    } catch (e) {
      console.error("Error al eliminar:", e);
      alert("Error al eliminar de SharePoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className={styles.headerSection}>
        <Stack>
          <Text variant="xxLarge" className={styles.tituloPrincipal}>Equipo EWS Energy</Text>
          <Text variant="small" className={styles.subtitulo}>Gestión centralizada del personal</Text>
        </Stack>
        <PrimaryButton
          text="Nuevo Personal"
          iconProps={{ iconName: "AddFriend" }}
          onClick={abrirNuevo}
          className={styles.btnNuevo}
        />
      </Stack>

      <div className={styles.gridPersonal}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <PersonaShimmer key={i} />)
        ) : empleados.length > 0 ? (
          empleados.map((emp) => (
            <div key={emp.Id} className={styles.cardEmpleado}>
              <div className={styles.editOverlay}>
                <IconButton 
                  iconProps={{ iconName: 'Edit' }} 
                  title={`Editar a ${emp.NombreyApellido}`} 
                  onClick={() => abrirEdicion(emp)} 
                  className={styles.editButton}
                />
              </div>
              <div className={styles.avatarArea}>
                <Persona imageUrl={emp.FotoPerfil} text={emp.NombreyApellido} size={PersonaSize.size100} hidePersonaDetails />
              </div>
              <Stack horizontalAlign="center" tokens={{ childrenGap: 4 }}>
                <Text className={styles.nombre}>{emp.NombreyApellido}</Text>
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                  <Icon iconName="WorkItem" className={styles.iconCargo} />
                  <Text className={styles.cargo}>{emp.Rol}</Text>
                </Stack>
              </Stack>
              <Separator styles={{ root: { margin: '15px 0' } }} />
              <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Text className={styles.idEmpleado}>ID: {emp.Id}</Text>
                <Icon iconName="Contact" className={styles.iconContact} />
              </Stack>
            </div>
          ))
        ) : (
          <MessageBar messageBarType={MessageBarType.info}>No se encontraron empleados.</MessageBar>
        )}
      </div>

      {/* PANEL DE EDICIÓN / ALTA */}
      <Panel 
        isOpen={isOpen} 
        onDismiss={() => setIsOpen(false)} 
        headerText={editandoId ? `Editar Perfil` : "Alta de Personal"}
        type={PanelType.smallFixedFar}
        isBlocking={false} 
      >
        <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 20 }}>
          <TextField 
            label="Nombre y Apellido" 
            required 
            value={formulario.NombreyApellido} 
            onChange={(_, v) => setFormulario({ ...formulario, NombreyApellido: v || "" })} 
          />
          <Dropdown 
            label="Rol / Cargo" 
            options={rolOptions} 
            selectedKey={formulario.Rol}
            onChange={(_, opt) => setFormulario({ ...formulario, Rol: opt?.key as string })} 
          />
          <Dropdown 
            label="Fotografía"
            options={fotoOptions}
            selectedKey={formulario.FotoPerfil}
            onChange={(_, opt) => setFormulario({ ...formulario, FotoPerfil: opt?.key as string })}
          />

          {formulario.FotoPerfil && (
            <div className={styles.previewBox}>
              <Stack horizontalAlign="center" tokens={{ childrenGap: 10 }}>
                <Text variant="small" style={{ fontWeight: 600 }}>Vista previa del carnet:</Text>
                <Persona imageUrl={formulario.FotoPerfil} size={PersonaSize.size120} hidePersonaDetails />
              </Stack>
            </div>
          )}

          <Stack horizontal tokens={{ childrenGap: 10 }} style={{ marginTop: 30 }}>
            {saving ? (
              <Spinner label="Procesando..." />
            ) : (
              <>
                <PrimaryButton 
                    text={editandoId ? "Actualizar" : "Registrar"} 
                    onClick={handleGuardar} 
                    disabled={!formulario.NombreyApellido.trim()} 
                />
                {editandoId && (
                  <DefaultButton 
                    text="Eliminar" 
                    onClick={() => setHideDeleteDialog(false)} 
                    styles={{ root: { color: '#a4262c', borderColor: '#a4262c' } }}
                  />
                )}
                <DefaultButton text="Cancelar" onClick={() => setIsOpen(false)} />
              </>
            )}
          </Stack>
        </Stack>
      </Panel>

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <Dialog
        hidden={hideDeleteDialog}
        onDismiss={() => setHideDeleteDialog(true)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Confirmar eliminación',
          subText: `¿Estás seguro de que quieres eliminar a ${formulario.NombreyApellido}? Esta acción no se puede deshacer.`
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton onClick={handleEliminar} text="Eliminar" styles={{ root: { backgroundColor: '#a4262c', borderColor: '#a4262c' } }} />
          <DefaultButton onClick={() => setHideDeleteDialog(true)} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    </div>
  );
};