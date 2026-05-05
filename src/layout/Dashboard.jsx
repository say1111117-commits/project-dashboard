import Sidebar from '../component/Sidebar.jsx';
import Header from '../component/Header.jsx'
import Contents from '../component/ContentArea.jsx';

import styles from '../styling/Dashboard.module.css'

export default function Dashboard(){
  return(
    <div className={styles.dashboardArea}> {/* main ng 2 divs */}
      <div className={styles.sidebarContainer}>
          <Sidebar />
      </div>
      <div className={styles.headContentContainer}>
          <Header />
          <Contents />
      </div>
    </div>
  )
}