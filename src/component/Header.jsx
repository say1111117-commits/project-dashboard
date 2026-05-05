import { useEffect, useState } from 'react'
import styles from '../styling/Header.module.css'

export default function Header(){

const [dateTime, setDateTime] = useState(new Date());

const formattedTime = dateTime.toLocaleTimeString();

const formattedDate = dateTime.toLocaleDateString('en-PH', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

useEffect(() => {
  const timer = setInterval(() => {
    setDateTime(new Date());
  },1000);
  return () => clearInterval(timer);
},[])
  return(
    <div className={styles.headContainer}>
      <div className={styles.div1}>Dashboard project</div>
      <div></div>
      <div className={styles.div3}>
          <div className={styles.dateBlock}>
            <span className={styles.label}>DATE</span>
          {formattedDate}
          </div>

          <div className={styles.separator}></div>
        
          <div className={styles.timeBlock}>
            <span className={styles.label}>TIME</span>
            {formattedTime}
          </div>
          
      </div>
    </div> 
  )
}