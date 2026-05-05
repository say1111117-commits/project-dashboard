import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import { usePage } from '../context/PageContext.jsx';

import { signOut } from 'firebase/auth';
// custom hook para kunin current logged-in user
import { useAuth } from '../context/Auth';

import { db, auth } from '../service/firebase';
import { doc, getDoc } from 'firebase/firestore';

import homeImg from '../images/home.png'
import aboutImg from '../images/about.png'
import logoutImg from '../images/logout.png'
import sunmoonImg from '../images/sunmoon.png'
import forwardArrowImg from '../images/forwardArrow.png'
import backwardArrowImg from '../images/backwardArrow.png'

import styles from '../styling/Sidebar.module.css'

export default function Sidebar(){

const navigate = useNavigate();

const {activePage, setActivePage} = usePage();

const [isCollapsed, setIsCollapsed] = useState(false);
const [userData, setUserData] = useState(null);

const { user } = useAuth();

// --------------------------------------------------------

useEffect(() => {

  if(!user){ // kung walang nakalogin
    setUserData(null); //clear userData
    return; // stop execution
  }

    const fetchUserData = async() => { // function para kumuha ng user data
      try {
        // gawa ng reference papunta sa firestore
        // 'users' - name ng database sa firestore
        // currentUser.uid - unique ID ng user (parang primary key)
        const docRef = doc(db, 'users', user.uid);

        // kinukuha yung actual data ng user mula sa database
        const actualData = await getDoc(docRef);

        // check kung may data na nakuha
        if (actualData.exists()) {
          // save yung data sa state (para magamit sa UI)
          // example ng laman: { firstName: "Juan", lastName: "Dela Cruz" }
          setUserData(actualData.data());
        }else{
          console.log("No user document found");
        }

      } catch (err) {
        // kung may error (ex. internet problem), show sa console
        console.log(err);
      }
    };

  fetchUserData();
}, [user]); // run every change ng user

// ----------------------------------------------------------

const handleExpand = useCallback(() => {
  setIsCollapsed(prev => !prev);
},[]);

const handleSignout = useCallback(async(e) => {
  e.preventDefault();
  await signOut(auth);
  navigate('/login', {replace:true});
},[navigate]);

  return(
    <div className={`
        ${styles.thisSidebar} 
        ${isCollapsed ? styles.collapsed : ''}
      `}>
      <div className={styles.btnExpandContainer}>
        {/* <div>click to collapse...</div> */}
        <button 
          title="collapse"
          onClick={handleExpand}>{isCollapsed ? <img src={forwardArrowImg}/> : <img src={backwardArrowImg}/>}</button>
      </div>

      <div className={styles.profileImgContainer}>
        <img src={sunmoonImg} />
      </div>
        <div className={styles.infoContainer}>
          <h4 className={styles.greetSidebar}>Welcome!</h4>
          <span>Name: {userData?.firstName}</span>
          <span>Email: {userData?.email}</span>
          <span>Role: {userData?.role}</span>
        </div>

        <div className={styles.btnContainer}>
          <button 
            title='home'
            onClick={() => setActivePage('home')}
            className={`${styles.homeBtn} ${activePage === 'home' ? styles.active : ''}`}
          >  
            <img src={homeImg} />
            <span className={styles.navigationLabel}>
            Home
            </span>
            </button>

          <button
            title='about'
            onClick={() => setActivePage('about')}
            className={`${styles.aboutBtn} ${activePage === 'about' ? styles.active : ''}`}
          >
            <img src={aboutImg} />
            <span className={styles.label}>
            About
            </span>
            </button>
          </div>
          
          <div className={styles.readMe}>
            <h5>READ ME</h5>
              <div className={styles.readMeContent}>
                By default, only the <strong>search field</strong> is enabled.
                <br /><br />
                Other input fields (name, email, etc.) enable only after clicking <strong>Add User</strong>.
                <br /><br />
                If you want to modify a user, you can click on the <strong>view</strong> button to enable the <strong>EDIT</strong> and <strong>UPDATE</strong> button.
              </div>
          </div>

          <div className={styles.logoutContainer}>
            <button 
              title='logout'
              onClick={handleSignout}>
              <img src={logoutImg} />
              <span className={styles.label}>
              Sign Out
              </span>
            </button>
          </div>
      </div>
  )
}