import * as React from "react";
import {
  Stack, Text, TextField, PrimaryButton, DetailsList, DetailsListLayoutMode,
  SelectionMode, IColumn, IconButton, Dropdown, IDropdownOption, SearchBox,
  Separator, Spinner, SpinnerSize
} from "@fluentui/react";
import styles from "../../Obras.module.scss";
import { StockService } from "../../../service/StockService";

const categorias: IDropdownOption[] = [
  { key: "Consumible", text: "Consumible" },
  { key: "Herramienta", text: "Herramienta" },
  { key: "Maquinaria", text: "Maquinaria" },
  { key: "EPIS", text: "EPIS" },
];

export const ListaMateriales: React.FC<{ context: any }> = (props) => {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [nuevo, setNuevo] = React.useState({ nombre: "", stock: 0, stockMin: 0, cat: "Consumible" });
  const [filterText, setFilterText] = React.useState("");
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editData, setEditData] = React.useState<any>(null);

  const service = new StockService(props.context);

  const cargarDatos = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await service.getInventario();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarDatos().catch(err => console.error(err));
  }, []);

  const handleAdd = async (): Promise<void> => {
    if (!nuevo.nombre) return;
    try {
      await service.crearMaterial({
        Title: nuevo.nombre,
        Categoria: nuevo.cat,
        StockActual: nuevo.stock,
        StockMinimo: nuevo.stockMin,
      });
      setNuevo({ nombre: "", stock: 0, stockMin: 0, cat: "Consumible" });
      await cargarDatos();
      alert("¡Material guardado correctamente!");
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    }
  };

  const handleEdit = async (id: number): Promise<void> => {
    try {
      await service.actualizarMaterial(id, editData);
      setEditId(null);
      await cargarDatos();
    } catch (e) {
      alert("Error al actualizar");
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm("¿Eliminar material?")) {
      await service.eliminarMaterial(id);
      await cargarDatos();
    }
  };

  const itemsFiltrados = items.filter((i) =>
    (i.Title || "").toLowerCase().includes(filterText.toLowerCase())
  );

  const columns: IColumn[] = [
    {
      key: "c1", name: "Material", fieldName: "Title", minWidth: 150,
      onRender: (item) => editId === item.Id ? 
        <TextField value={editData.Title} onChange={(_, v) => setEditData({ ...editData, Title: v })} /> : 
        <span>{item.Title}</span>
    },
    {
      key: "c2", name: "Categoría", fieldName: "Categoria", minWidth: 100,
      onRender: (item) => editId === item.Id ? 
        <Dropdown options={categorias} selectedKey={editData.Categoria} onChange={(_, o) => setEditData({ ...editData, Categoria: o?.key })} /> : 
        <span>{item.Categoria || "General"}</span>
    },
    {
      key: "c3", name: "Actual", fieldName: "StockActual", minWidth: 60,
      onRender: (item) => editId === item.Id ? 
        <TextField type="number" value={(editData.StockActual || 0).toString()} onChange={(_, v) => setEditData({ ...editData, StockActual: parseInt(v || "0") })} /> : 
        <span>{item.StockActual || 0}</span>
    },
    {
      key: "c4", name: "Mínimo", fieldName: "StockMinimo", minWidth: 60,
      onRender: (item) => editId === item.Id ? 
        <TextField type="number" value={(editData.StockMinimo || 0).toString()} onChange={(_, v) => setEditData({ ...editData, StockMinimo: parseInt(v || "0") })} /> : 
        <span>{item.StockMinimo || 0}</span>
    },
    {
      key: "actions", name: "Acciones", minWidth: 100,
      onRender: (item) => (
        <Stack horizontal tokens={{ childrenGap: 5 }}>
          {editId === item.Id ? (
            <>
              <IconButton iconProps={{ iconName: "CheckMark" }} onClick={() => handleEdit(item.Id)} styles={{ root: { color: "green" } }} />
              <IconButton iconProps={{ iconName: "Cancel" }} onClick={() => setEditId(null)} styles={{ root: { color: "red" } }} />
            </>
          ) : (
            <>
              <IconButton iconProps={{ iconName: "Edit" }} onClick={() => { setEditData({ ...item }); setEditId(item.Id); }} />
              <IconButton iconProps={{ iconName: "Delete" }} onClick={() => handleDelete(item.Id)} styles={{ root: { color: "#d13438" } }} />
            </>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>📦 Inventario de Materiales</Text>
      <Stack className={styles.formCard} tokens={{ childrenGap: 10 }}>
        <Text variant="large" style={{ fontWeight: 600 }}>Añadir nuevo</Text>
        <Stack horizontal wrap tokens={{ childrenGap: 15 }} verticalAlign="end">
          <TextField label="Nombre" value={nuevo.nombre} onChange={(_, v) => setNuevo({ ...nuevo, nombre: v || "" })} />
          <Dropdown label="Categoría" options={categorias} selectedKey={nuevo.cat} onChange={(_, o) => setNuevo({ ...nuevo, cat: o?.key as string })} styles={{ root: { width: 140 } }} />
          <TextField label="Stock" type="number" value={nuevo.stock.toString()} onChange={(_, v) => setNuevo({ ...nuevo, stock: parseInt(v || "0") })} styles={{ root: { width: 80 } }} />
          <TextField label="Mínimo" type="number" value={nuevo.stockMin.toString()} onChange={(_, v) => setNuevo({ ...nuevo, stockMin: parseInt(v || "0") })} styles={{ root: { width: 80 } }} />
          <PrimaryButton text="Añadir" onClick={handleAdd} />
        </Stack>
      </Stack>
      <Separator />
      <SearchBox placeholder="Buscar material..." onChange={(_, v) => setFilterText(v || "")} styles={{ root: { width: 300 } }} />
      {loading ? <Spinner size={SpinnerSize.large} label="Cargando..." /> : 
        <div className={styles.tableContainer}>
          <DetailsList items={itemsFiltrados} columns={columns} selectionMode={SelectionMode.none} layoutMode={DetailsListLayoutMode.justified} />
        </div>
      }
    </Stack>
  );
};