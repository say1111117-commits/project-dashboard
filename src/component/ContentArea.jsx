import { usePage } from '../context/PageContext'
import Home from '../component/Home.jsx'
import About from '../component/About.jsx'

import styles from '../styling/ContentArea.module.css'

export default function Contents(){

const {activePage} = usePage();

  return(
    
      <div className={styles.contentContainer}>
        {activePage === 'home' && <Home/>}
        {activePage === 'about' && <About/>}
      </div>

  )
}