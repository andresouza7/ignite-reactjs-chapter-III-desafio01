import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <div className={commonStyles.container}>
      <Link href="/">
        <img className={styles.header} src="/Logo.svg" alt="logo" />
      </Link>
    </div>
  );
}
