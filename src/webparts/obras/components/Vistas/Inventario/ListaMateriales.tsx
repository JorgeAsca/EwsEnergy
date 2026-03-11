import * as React from 'react';
import { Stack, Text, TextField, PrimaryButton, DetailsList, DetailsListLayoutMode, SelectionMode, IColumn, Icon } from '@fluentui/react';
import styles from '../../Obras.module.scss';

interface IListaMaterialesProps {
  items: any[];
  onAddMaterial: (nombre: string, stock: number) => void;
}

const columns: IColumn[] = [
  { key: 'icon', name: '', fieldName: 'icon', minWidth: 20, maxWidth: 20, onRender: () => <Icon iconName="Package" /> },
  { key: 'col1', name: 'Material', fieldName: 'Title', minWidth: 100, maxWidth: 200 },
  { key: 'col2', name: 'Stock Actual', fieldName: 'StockActual', minWidth: 70, maxWidth: 100 },
];

export const ListaMateriales: React.FC<IListaMaterialesProps> = (props) => {
  const [nombre, setNombre] = React.useState('');
  const [stock, setStock] = React.useState(0);

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge" style={{ color: '#004a99', fontWeight: 600 }}>📦 Inventario EWS</Text>
      
      <Stack className={styles.formCard} tokens={{ childrenGap: 15 }}>
        <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="end">
          <TextField label="Nombre" value={nombre} onChange={(_, v) => setNombre(v || '')} />
          <TextField label="Stock" type="number" value={stock.toString()} onChange={(_, v) => setStock(parseInt(v || '0'))} />
          <PrimaryButton text="Añadir" onClick={() => { props.onAddMaterial(nombre, stock); setNombre(''); setStock(0); }} iconProps={{ iconName: 'Add' }} />
        </Stack>
      </Stack>

      <div className={styles.tableContainer}>
        <DetailsList items={props.items} columns={columns} layoutMode={DetailsListLayoutMode.justified} selectionMode={SelectionMode.none} />
      </div>
    </Stack>
  );
};