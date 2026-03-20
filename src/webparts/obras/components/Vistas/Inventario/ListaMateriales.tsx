import * as React from "react";
import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  IconButton,
  Dropdown,
  IDropdownOption,
  SearchBox,
  Separator,
  Spinner,
  SpinnerSize,
  Image,
  ImageFit,
} from "@fluentui/react";
import styles from "./ListaMateriales.module.scss"; // Cambiado a su propio CSS
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

  // Añadimos imagenUrl al estado de creación
  const [nuevo, setNuevo] = React.useState({
    nombre: "",
    stock: 0,
    stockMin: 0,
    cat: "Consumible",
    imagenUrl: "",
  });
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
    cargarDatos().catch((err) => console.error(err));
  }, []);

  const handleAdd = async (): Promise<void> => {
    if (!nuevo.nombre) return;
    try {
      await service.crearMaterial({
        Title: nuevo.nombre,
        Categoria: nuevo.cat,
        StockActual: nuevo.stock,
        StockMinimo: nuevo.stockMin,
        ImagenUrl: nuevo.imagenUrl, // Guardamos la URL de la imagen en SharePoint
      });
      setNuevo({
        nombre: "",
        stock: 0,
        stockMin: 0,
        cat: "Consumible",
        imagenUrl: "",
      });
      await cargarDatos();
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
    if (confirm("¿Eliminar material permanentemente?")) {
      await service.eliminarMaterial(id);
      await cargarDatos();
    }
  };

  const itemsFiltrados = items.filter((i) =>
    (i.Title || "").toLowerCase().includes(filterText.toLowerCase()),
  );

  const columns: IColumn[] = [
    {
      key: "c0",
      name: "Foto",
      fieldName: "ImagenUrl",
      minWidth: 50,
      maxWidth: 50,
      onRender: (item) =>
        editId === item.Id ? (
          <TextField
            value={editData.ImagenUrl || ""}
            onChange={(_, v) => setEditData({ ...editData, ImagenUrl: v })}
            placeholder="URL Foto"
          />
        ) : (
          <Image
            src={item.ImagenUrl || "https://via.placeholder.com/40?text=Img"}
            width={40}
            height={40}
            imageFit={ImageFit.cover}
            className={styles.fotoProducto}
          />
        ),
    },
    {
      key: "c1",
      name: "Material",
      fieldName: "Title",
      minWidth: 150,
      onRender: (item) =>
        editId === item.Id ? (
          <TextField
            value={editData.Title}
            onChange={(_, v) => setEditData({ ...editData, Title: v })}
          />
        ) : (
          <span style={{ fontWeight: 600, color: "#333" }}>{item.Title}</span>
        ),
    },
    {
      key: "c2",
      name: "Categoría",
      fieldName: "Categoria",
      minWidth: 100,
      onRender: (item) =>
        editId === item.Id ? (
          <Dropdown
            options={categorias}
            selectedKey={editData.Categoria}
            onChange={(_, o) => setEditData({ ...editData, Categoria: o?.key })}
          />
        ) : (
          <span className={styles.badgeCategoria}>
            {item.Categoria || "General"}
          </span>
        ),
    },
    {
      key: "c3",
      name: "Stock Actual",
      fieldName: "StockActual",
      minWidth: 80,
      onRender: (item) =>
        editId === item.Id ? (
          <TextField
            type="number"
            value={(editData.StockActual || 0).toString()}
            onChange={(_, v) =>
              setEditData({ ...editData, StockActual: parseInt(v || "0") })
            }
          />
        ) : (
          <span
            className={
              item.StockActual <= item.StockMinimo
                ? styles.stockCritico
                : styles.stockNormal
            }
          >
            {item.StockActual || 0}
          </span>
        ),
    },
    {
      key: "c4",
      name: "Mínimo",
      fieldName: "StockMinimo",
      minWidth: 80,
      onRender: (item) =>
        editId === item.Id ? (
          <TextField
            type="number"
            value={(editData.StockMinimo || 0).toString()}
            onChange={(_, v) =>
              setEditData({ ...editData, StockMinimo: parseInt(v || "0") })
            }
          />
        ) : (
          <span>{item.StockMinimo || 0}</span>
        ),
    },
    {
      key: "actions",
      name: "Acciones",
      minWidth: 100,
      onRender: (item) => (
        <Stack horizontal tokens={{ childrenGap: 5 }}>
          {editId === item.Id ? (
            <>
              <IconButton
                iconProps={{ iconName: "CheckMark" }}
                onClick={() => handleEdit(item.Id)}
                styles={{ root: { color: "#2e7d32" } }}
              />
              <IconButton
                iconProps={{ iconName: "Cancel" }}
                onClick={() => setEditId(null)}
                styles={{ root: { color: "#d13438" } }}
              />
            </>
          ) : (
            <>
              <IconButton
                iconProps={{ iconName: "Edit" }}
                onClick={() => {
                  setEditData({ ...item });
                  setEditId(item.Id);
                }}
              />
              <IconButton
                iconProps={{ iconName: "Delete" }}
                onClick={() => handleDelete(item.Id)}
                styles={{ root: { color: "#d13438" } }}
              />
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Text variant="xxLarge" className={styles.titulo}>
        📦 Gestión de Materiales y Herramientas
      </Text>

      <Stack className={styles.formCard} tokens={{ childrenGap: 10 }}>
        <Text variant="large" style={{ fontWeight: 600, color: "#004d40" }}>
          Dar de alta nuevo material
        </Text>
        <Stack horizontal wrap tokens={{ childrenGap: 15 }} verticalAlign="end">
          <TextField
            label="Nombre del artículo"
            value={nuevo.nombre}
            onChange={(_, v) => setNuevo({ ...nuevo, nombre: v || "" })}
          />
          <Dropdown
            label="Categoría"
            options={categorias}
            selectedKey={nuevo.cat}
            onChange={(_, o) => setNuevo({ ...nuevo, cat: o?.key as string })}
            styles={{ root: { width: 140 } }}
          />
          <TextField
            label="URL de Imagen (Opcional)"
            value={nuevo.imagenUrl}
            onChange={(_, v) => setNuevo({ ...nuevo, imagenUrl: v || "" })}
            placeholder="https://..."
            styles={{ root: { width: 180 } }}
          />
          <TextField
            label="Stock Actual"
            type="number"
            value={nuevo.stock.toString()}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, stock: parseInt(v || "0") })
            }
            styles={{ root: { width: 90 } }}
          />
          <TextField
            label="Stock Mínimo"
            type="number"
            value={nuevo.stockMin.toString()}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, stockMin: parseInt(v || "0") })
            }
            styles={{ root: { width: 90 } }}
          />
          <PrimaryButton
            text="Registrar Artículo"
            onClick={handleAdd}
            className={styles.btnAdd}
          />
        </Stack>
      </Stack>

      <div className={styles.searchSection}>
        <SearchBox
          placeholder="Buscar por nombre de material..."
          onChange={(_, v) => setFilterText(v || "")}
          styles={{ root: { width: 350 } }}
        />
      </div>

      {loading ? (
        <Spinner size={SpinnerSize.large} label="Consultando almacén..." />
      ) : (
        <div className={styles.tableContainer}>
          <DetailsList
            items={itemsFiltrados}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
          />
        </div>
      )}
    </div>
  );
};
