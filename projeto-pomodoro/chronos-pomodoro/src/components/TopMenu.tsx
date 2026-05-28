import styles from './TopMenu.module.css';

export default function TopMenu() {
  return (
    <nav className={styles.topMenu} aria-label="Navegação principal">
      <div className={styles.brand}>
        <span className={styles.signal} aria-hidden="true" />
        <strong>Chronos</strong>
      </div>
      <ul className={styles.links}>
        <li>
          <a href="#settings">Configurações</a>
        </li>
        <li>
          <a href="#focus">Ciclo</a>
        </li>
        <li>
          <a href="#history">Histórico</a>
        </li>
      </ul>
    </nav>
  );
}
