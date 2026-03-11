import * as React from 'react';
import { PersonalService } from '../../../service/PersonalService';
import { IPersonal } from '../../../models/IPersonal';
import styles from './GaleriaPersonal.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';

export const GaleriaPersonal: React.FC<{ context: any }> = (props) => {
  const [personal, setPersonal] = React.useState<IPersonal[]>([]);
  const [nuevo, setNuevo] = React.useState({ Title: '', Rol: 'Operario', Email: '', EmpresaAsociada: '' });
  const service = new PersonalService(props.context);

  const cargarPersonal = () => service.getPersonal().then(setPersonal);
  React.useEffect(() => { cargarPersonal(); }, []);

  const handleGuardar = async () => {
    if (!nuevo.Title || !nuevo.Email) return alert("Nombre y Email son obligatorios");
    await service.crearTrabajador(nuevo);
    setNuevo({ Title: '', Rol: 'Operario', Email: '', EmpresaAsociada: '' });
    cargarPersonal();
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar a este trabajador?")) {
      // Aquí llamaremos al método delete que crearemos en el servicio
      alert("Función de borrado conectando...");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Gestión de Personal y Equipos</h2>

      {/* Formulario de Alta */}
      <div className={styles.formAlta}>
        <input type="text" placeholder="Nombre Completo" value={nuevo.Title} onChange={e => setNuevo({...nuevo, Title: e.target.value})} />
        <input type="email" placeholder="Correo Electrónico" value={nuevo.Email} onChange={e => setNuevo({...nuevo, Email: e.target.value})} />
        <select value={nuevo.Rol} onChange={e => setNuevo({...nuevo, Rol: e.target.value})}>
          <option value="Operario">Operario</option>
          <option value="Manager">Manager</option>
          <option value="Administrador">Administrador</option>
        </select>
        <button onClick={handleGuardar} className={styles.btnPrimario}>Registrar Personal</button>
      </div>

      {/* Galería de Tarjetas */}
      <div className={styles.grid}>
        {personal.map(p => (
          <div key={p.Id} className={styles.card}>
            <div className={styles.acciones}>
                <Icon iconName="Edit" className={styles.iconEdit} onClick={() => alert('Editar ID: ' + p.Id)} />
                <Icon iconName="Delete" className={styles.iconDelete} onClick={() => handleEliminar(p.Id)} />
            </div>
            <div className={styles.avatar}>
               {p.FotoPerfil ? <img src={p.FotoPerfil.Url} /> : <span>{p.Title.charAt(0)}</span>}
            </div>
            <h4>{p.Title}</h4>
            <span className={styles.badgeRol}>{p.Rol}</span>
            <p className={styles.emailText}>{p.Email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};