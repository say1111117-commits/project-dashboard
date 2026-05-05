import { useCallback, useEffect, useState, useRef } from "react";

import { db, auth } from "../service/firebase";
import { getDocs, doc , collection, setDoc, deleteDoc, updateDoc} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp, deleteApp} from "firebase/app";

import { usePage } from "../context/PageContext"
import { useAuth } from "../context/Auth";

import trashImg from '../images/trashcan.png'
import viewImg from '../images/view.png'
import trashDisabled from '../images/trashDisabled.png'
import viewDisabled from '../images/viewDisabled.png'
import styles from "../styling/Home.module.css"

export default function Home(){

const {user: loggedInUser, role: currentUserRole} = useAuth();

const searchFocus = useRef();

const [showModal, setShowModal] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);

const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
const [message, setMessage] = useState('');

const {activePage} = usePage();
const [isUser, setIsUser] = useState([]);

const [search, setSearch] = useState('');
const [isChecked, setIsChecked] = useState(false);
const [selectedUserID, setSelectedUserID] = useState(null);
const [isSelectedUser, setSelectedUser] = useState(false);
const [mode, setMode] = useState('view');

const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [role, setRole] = useState('');

const isViewMode = mode === 'view';
const isEditMode = mode === 'edit';
const isAddMode = mode === 'adding';

const firebaseConfig = {
  apiKey: "AIzaSyB8FtSo_QsuP_HWWmoRei8vDGhB_S7mc7w", // unique key para ma-access ang project
  authDomain: "my-login-app-a2f2d.firebaseapp.com", // domain para sa authentication (login, signup)
  projectId: "my-login-app-a2f2d", // ID ng project mo sa Firebase
  storageBucket: "my-login-app-a2f2d.firebasestorage.app", // storage para sa files (images, etc.)
  messagingSenderId: "399822972540", // ginagamit sa push notifications (Firebase Cloud Messaging)
  appId: "1:399822972540:web:09fe08d1c1e101a4530bf9" // unique identifier ng app mo
};

useEffect(() => {
  searchFocus.current?.focus();
},[]);

const filteredUsers = isUser.filter(u => {
  const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
  return (
    fullName.includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );
});

// 1. open ang modal at isave kung sinong user ang iki-clear
const confirmDelete = (user) => {
  setUserToDelete(user);
  setShowModal(true);
}
// 2. Kapag pinindot ang 'Confirm' sa modal
const handleDelete = async() => {
  if(!userToDelete) return;

  setIsLoading(true);
  try{
    await deleteDoc(doc(db, 'users', userToDelete.id));
    setShowModal(false);
    // Update local state para mawala sa table agad
    setIsUser(prev => prev.filter(u => u.id !== userToDelete.id));
    setMessage(`Successfully deleted ${userToDelete.firstName} ${userToDelete.lastName}`);
    setUserToDelete(null);
  }catch (err){
    setError("Failed to delete user: " + err.message);
  }finally{
    setIsLoading(false);
  }
}

const handleSave = useCallback(async(e) => {
  if (e) e.preventDefault(); // STOP the page refresh

  if(!firstName || !lastName || !email || !password || !role){
    setError('error: All fields are required.');
    setMessage('');
    return;
  }

  // 2. Stricter Email Validation gamit ang Regex
  // Iche-check nito kung may @ at may dot (.) pagkatapos ng domain
  const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

  if (!emailRegex.test(email)) {
    setError("Error: Invalid email format (e.g., name@example.com)");
    setMessage(''); // Siguraduhin na walang success message na nakaharang
    return;
  }

  setIsLoading(true);
  setError('');
  setMessage('');

  let secondaryApp; // para ma-access sa finally block
  
  try{

    // temporary app na may ibang pangalan (e.g., 'Secondary')
    secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    const dataRef = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUID = dataRef.user.uid;

    // 2. I-prepare ang user object para sa Firestore at local state
    const newUser = {
      id: newUID,
      firstName,
      lastName,
      email,
      role
    };

    // i-save sa Firestore
    await setDoc(doc(db, 'users', newUID), newUser);

    // Importante: I-delete ang secondary app pagkatapos para malinis ang memory
      // await secondaryApp.delete();

    // i-update ang local state para makita agad sa table
    setIsUser(prev => [...prev, {...newUser}]);
    setMessage('Successfully added a new user.');
    setMode('view'); // ibalik sa view mode matapos ang save
    // clear inputs
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setIsChecked(false);
    setRole('');

  }catch (err){
    if(err.code === 'auth/weak-password'){
      setError('error: Password should be at least 6 characters (auth/weak-password).');
      setMessage('');
    }else if(err.code === 'auth/email-already-in-use'){
      setError('error: auth/email-already-in-use.');
      setMessage('');
    }else{
    setError(err.message);
    clearAll()
    }
  }finally{
    // 5. Linisin ang secondary app para hindi mag-error sa susunod na save
    if (secondaryApp) {
      await deleteApp(secondaryApp);
    }
    setIsLoading(false);
  }
},[firstName, lastName, email, password, role]);

const handleEdit = (e) => {
  if (e) e.preventDefault();
  setMode('edit');
  setMessage('You are currently Editing a user.');
}

const handleUpdate = useCallback(async(e) => {
  if(e) e.preventDefault();
  
  if(!firstName || !lastName){
    setError('error: All fields are required.');
    setMessage('');
  }

  if(!selectedUserID){
    setError('No user to Update.');
    return;
  }

  setIsLoading(true);
  setError('');
  setMessage('');

  try{
    const userRef = doc(db, 'users', selectedUserID);

    await updateDoc(userRef,{
      firstName,
      lastName, 
      role
    });

    setIsUser(prev => prev.map( u => u.id === selectedUserID ? 
      {...u, firstName, lastName, role, password} : u));

    setMessage('User updated successfully!');
    setMode('view');
    setSelectedUser(false);
    setSelectedUserID(null);

    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('');

  }catch (err){
    setError(err.message);
  }finally{
    setIsLoading(false);
  }
},[selectedUserID, firstName, lastName, role]);

const addUSer = () => {
  if (isAddMode) {
    // kung 'Cancel' ang pinindot, clear inputs at bumalik sa view mode
    setMode('view');
    setMessage('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole('');
    setError('');
    setMessage('');
  } else {
    // kung 'Add User' ang clinick bumalik sa adding mode
    setMode('adding');
    setMessage('You are currently adding a user.');
    setError('');
    setSelectedUser(false); // ensure walang naka-select na user mula sa table
    
    // clear inputs para sa bagong user
    setSearch('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setIsChecked(false);
    setRole('');
  }
}

const displayUser = (user) => { // view btn
  setFirstName(user.firstName);
  setLastName(user.lastName);
  setEmail(user.email);
  setRole(user.role);
  setMessage('You are currently viewing a user.');
  setSelectedUserID(user.id);
  setSelectedUser(true);
  setMode('view');
  setError('');
}

const cancelAction = () => { // cancel btn
  setSearch('');
  setFirstName('');
  setLastName('');
  setEmail('');
  setPassword('');
  setIsChecked(false);
  setRole('');
  setMessage('');
}

const clearAll = () => { // clear all btn
  setSearch('');
  setFirstName('');
  setLastName('');
  setEmail('');
  setPassword('');
  setIsChecked(false);
  setRole('');
  setMessage('');
  setError('');

  // 1. enable ang 'Add User' btn
  // ang 'Add User' ay disabled kapag ang mode ay 'edit'. 
  setMode('view'); // i-set pabalik sa 'view' o 'adding'.

  // 2. change from 'Update' to 'Edit' and disable it
  // dahil ang label ay nakadepende sa (isEditMode ? 'Update' : 'Edit')
  // at ang disabled attribute ay nakadepende sa (!isSelectedUser)
  setSelectedUser(false);
  setSelectedUserID(null);
}

const passwordOnChange = (e) => {
  const val = e.target.value;
  setPassword(val);

  if(!val){
    setIsChecked(false);
  }
}

const showPassword = () => {
  setIsChecked(prev => !prev);
}

useEffect(() => {
  const fetchUsers = async() => {

    try{
      const refData = collection(db, 'users');
      const allData = await getDocs(refData);

      const userList = allData.docs.map(doc => ({
        id: doc.id, ...doc.data()
      }));
      setIsUser(userList);
    }catch (err){
      console.log(err);
    }
  };
  fetchUsers();
},[]);

  return(
    <div className={styles.homeContainer}>

      <div className={styles.userDataContainer}> {/* 1st half div  */}
        
        <div className={styles.headArea}>
          <span>Home</span>
        </div>

        <div className={styles.statusArea}>
          
          {/* LOADING STATE */}
          {isLoading && (
            <div className={`${styles.statusBadge} ${styles.loadingBadge}`}>
              <div className={styles.spinner}></div>
              <span>Processing...</span>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className={`${styles.statusBadge} ${styles.errorBadge}`}>
              <span className={styles.icon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* MESSAGE/SUCCESS STATE */}
          {message && (
            <div className={`${styles.statusBadge} ${styles.successBadge}`}>
              <span className={styles.icon}>✅</span>
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchText}>
            Search Data:
          </div>
          <div>
            <input type="text" placeholder="Search..."
              ref={searchFocus}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.resultsText}>
            Total Results: {filteredUsers.length}
          </div>
        </div>

        <form className={styles.userData} onSubmit={(e) => {
          e.preventDefault();
          if(isEditMode){
            handleUpdate(e);
          }else if(isAddMode){
            handleSave(e);
          }
        }}>
          <span>First Name: 
            <input type="text" placeholder='*First Name' readOnly={isViewMode}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </span>
          <span>
            Last Name: 
            <input type="text" placeholder='*Last Name' readOnly={isViewMode}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </span>
          <span>
            {isEditMode ? 
              <span className={styles.emailPasswordText}>Sorry, email change not allowed.</span> : 'Email:'}
            <input type= "email" placeholder='*Email' readOnly={isViewMode || isEditMode}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          </span>
          <span>
            {isEditMode ? 
              <span className={styles.emailPasswordText}>Sorry, password change not allowed.</span> : 'Password:'}
            <input placeholder='*Password' readOnly={isViewMode || isEditMode}
              value={password}
              type={isChecked ? 'text' : 'password'}
              onChange={passwordOnChange} 
            />
          </span>

          <div className={styles.checkboxContainer}>
            <label htmlFor="showPassword">Show Password:</label>
            <input 
              id="showPassword"
              type='checkbox'
              checked={isChecked}
              onChange={showPassword}
            />
          </div>

          <span>Role: &nbsp;
            <select
              disabled={isViewMode}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option>user</option>
              <option>admin</option>
            </select>
          </span>

          <div className={styles.actionBtnscontainer}>
            <div className={styles.addSavebtn}>
              <button 
                disabled={isEditMode || currentUserRole === 'user'} // disable pag nasa edit mode (bawal mag-add habang nag-eedit)
                type="button"
                className={styles.addBtn}
                onClick={addUSer} // function na mag-toggle ng add/cancel
                >{isAddMode ? 'Cancel' : 'Add User'} {/* pag adding → Cancel, else → Add User */}
              </button>
              <button 
                disabled={!isAddMode || currentUserRole === 'user'} // enabled lang pag adding mode (hindi kasama edit mode dito)
                className={styles.saveBtn}
                // onClick={handleSave}
                type="submit"
                >Save
              </button>
              <button 
                disabled={!isSelectedUser || currentUserRole === 'user'} // disable kapag walang selected user sa table
                type={isEditMode ? 'submit' : 'button'}
                className={styles.editBtn} 
                onClick={isEditMode ? null : handleEdit} // Kung view mode, switch to edit. Kung edit mode, hayaan ang form submit.
                >{isEditMode ? 'Update' : 'Edit'} {/* pag edit mode → Update, else → Edit */}
              </button>
            </div>

            <div className={styles.clearBtnContainer}>
              <button 
                type="button"
                className={styles.clearAllBtn}
                onClick={clearAll}
                >Clear All
              </button>
              </div>
          </div>
        </form>
      </div>
{/* ------------------------------ Table area ---------------------------------- */}
      <div className={styles.tableContainer}> {/* 2nd half div  */}
        <table className={styles.myTable}>
          <thead>
            <tr className={styles.rowHead}>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Email Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr 
              // className={styles.rowData}
              className={`${styles.rowData} ${selectedUserID === user.id ? styles.highlightedRow : ''}`}
    key={user.id}
              key={user.id}>
                <td>{i + 1}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>

                <td className={styles.actionBtnContainer}>

                  <button 
                    className={styles.viewBtn}
                    onClick={() => displayUser(user)}
                    disabled={currentUserRole === 'user' && user.id !== loggedInUser?.uid}
                  >
                    <img src={currentUserRole === 'user' && user.id !== loggedInUser?.uid ? viewDisabled : viewImg}/>
                    <span className={styles.viewLabel}>
                  view
                  </span>
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => confirmDelete(user)}
                    disabled={currentUserRole === 'user'}
                  >
                      <img src={currentUserRole === 'user' ? trashDisabled : trashImg} />
                    <span className={styles.deleteLabel}>
                    delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Confirm Deletion</h3>
              <p>
                Are you sure you want to permanently delete 
                <strong> {userToDelete?.firstName} {userToDelete?.lastName}</strong>?
              </p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleDelete}>Confirm</button>
                <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}