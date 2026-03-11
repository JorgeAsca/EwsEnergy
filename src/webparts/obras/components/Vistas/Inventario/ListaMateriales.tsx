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
} from "@fluentui/react";
import styles from "../../Obras.module.scss";
import { StockService } from "../../../service/StockService";

const categorias: IDropdownOption[] = [
  { key: "Consumible", text: "Consumible" },
  { key: "Herramienta", text: "Herramienta" },
  { key: "Maquinaria", text: "Maquinaria" },
  { key: "EPIS", text: "EPIS" },
];

export const ListaMateriales: React.FC<any> = (props) => {
  const [nuevo, setNuevo] = React.useState({
    nombre: "",
    stock: 0,
    stockMin: 0,
    cat: "Consumible",
  });
  const [filterText, setFilterText] = React.useState("");
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editData, setEditData] = React.useState<any>(null);

  const itemsFiltrados = (props.items || []).filter((i: any) =>
    (i.Title || "").toLowerCase().includes(filterText.toLowerCase()),
  );

  const columns: IColumn[] = [
    {
      key: "c1",
      name: "Material",
      fieldName: "Title",
      minWidth: 150,
      onRender: (item) =>
        editId === (item.Id || item.ID) && editData ? (
          <TextField
            value={editData.Title}
            onChange={(_, v) => setEditData({ ...editData, Title: v })}
          />
        ) : (
          <span>{item.Title}</span>
        ),
    },
    {
      key: "c2",
      name: "Categoría",
      fieldName: "Categoria",
      minWidth: 100,
      onRender: (item) =>
        editId === (item.Id || item.ID) && editData ? (
          <Dropdown
            options={categorias}
            selectedKey={editData.Categoria}
            onChange={(_, o) => setEditData({ ...editData, Categoria: o?.key })}
          />
        ) : (
          <span>{item.Categoria || "General"}</span>
        ),
    },
    {
      key: "c3",
      name: "Actual",
      fieldName: "StockActual",
      minWidth: 60,
      onRender: (item) =>
        editId === (item.Id || item.ID) && editData ? (
          <TextField
            type="number"
            value={(editData.StockActual || 0).toString()}
            onChange={(_, v) =>
              setEditData({ ...editData, StockActual: parseInt(v || "0") })
            }
          />
        ) : (
          <span>{item.StockActual || 0}</span>
        ),
    },
    {
      key: "c4",
      name: "Mínimo",
      fieldName: "StockMinimo",
      minWidth: 60,
      onRender: (item) =>
        editId === (item.Id || item.ID) && editData ? (
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
      onRender: (item) => {
        const currentId = item.Id || item.ID;
        return (
          <Stack horizontal tokens={{ childrenGap: 5 }}>
            {editId === currentId ? (
              <>
                <IconButton
                  iconProps={{ iconName: "CheckMark" }}
                  onClick={() => {
                    props.onEditMaterial(
                      currentId,
                      editData.Title,
                      editData.StockActual,
                      editData.StockMinimo,
                      editData.Categoria,
                    );
                    setEditId(null);
                  }}
                  styles={{ root: { color: "green" } }}
                />
                <IconButton
                  iconProps={{ iconName: "Cancel" }}
                  onClick={() => {
                    setEditId(null);
                    setEditData(null);
                  }}
                  styles={{ root: { color: "red" } }}
                />
              </>
            ) : (
              <>
                <IconButton
                  iconProps={{ iconName: "Edit" }}
                  onClick={() => {
                    setEditData({ ...item });
                    setEditId(currentId);
                  }}
                />
                <IconButton
                  iconProps={{ iconName: "Delete" }}
                  onClick={() => props.onDeleteMaterial(currentId)}
                  styles={{ root: { color: "#d13438" } }}
                />
              </>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge" style={{ color: "#004a99", fontWeight: 600 }}>
        📦 Inventario de Materiales
      </Text>

      <Stack className={styles.formCard} tokens={{ childrenGap: 10 }}>
        <Text variant="large" style={{ fontWeight: 600 }}>
          Añadir nuevo
        </Text>
        <Stack horizontal wrap tokens={{ childrenGap: 15 }} verticalAlign="end">
          <TextField
            label="Nombre"
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
            label="Stock"
            type="number"
            value={nuevo.stock.toString()}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, stock: parseInt(v || "0") })
            }
            styles={{ root: { width: 80 } }}
          />
          <TextField
            label="Mínimo"
            type="number"
            value={nuevo.stockMin.toString()}
            onChange={(_, v) =>
              setNuevo({ ...nuevo, stockMin: parseInt(v || "0") })
            }
            styles={{ root: { width: 80 } }}
          />
          <PrimaryButton
            text="Añadir"
            onClick={() => {
              props.onAddMaterial(
                nuevo.nombre,
                nuevo.stock,
                nuevo.stockMin,
                nuevo.cat,
              );
              setNuevo({
                nombre: "",
                stock: 0,
                stockMin: 0,
                cat: "Consumible",
              });
            }}
          />
        </Stack>
      </Stack>

      <Separator />

      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 20 }}>
        <SearchBox
          placeholder="Buscar material..."
          onChange={(_, v) => setFilterText(v || "")}
          styles={{ root: { width: 300 } }}
        />
      </Stack>

      <div className={styles.tableContainer}>
        <DetailsList
          items={itemsFiltrados}
          columns={columns}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.justified}
        />
      </div>
    </Stack>
  );
};
