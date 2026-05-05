import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { auth, db } from '../service/firebase'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/Auth'

import styles from '../styling/Register.module.css'
import { first } from 'firebase/firestore/pipelines'

export default function Register(){

const {user, isAuthLoading} = useAuth();

const [submitting, setSubmitting] = useState(false); // local loading
const [error, setError] = useState('');

const [message, setMessage] = useState('');

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');

const [isChecked, setIsChecked] = useState(false); // checkbox
const navigate = useNavigate(); // page switch

const resetInput = useCallback(() => {
  setFirstName('');
  setLastName('');
  setEmail('');
  setPassword('');
  setIsChecked(false);
},[]);

const handleRegister = useCallback(async(e) => { // form submit/ onSubmit
  e.preventDefault();

  if(!firstName || !lastName || !email || !password){
    setError('error: Please fill in all required fields.');
    setMessage('');
    return;
  }

  setSubmitting(true); // local loading
  setError('');
  setMessage('');
  try{
    
    const userData = await createUserWithEmailAndPassword(auth, email, password);
    const dataUser = userData.user;

    await setDoc(doc(db, 'users', dataUser.uid), {
      firstName, lastName, email, role: 'user'
    });

    await signOut(auth);
    resetInput();
    setMessage('Account succesfully created.');
    setError('');
  }catch (err){
    console.log(err);
    if(err.code === 'auth/weak-password'){
      setError('error: Password should be at least 6 characters (auth/weak-password).');
      setMessage('');
    }else if(err.code === 'auth/email-already-in-use'){
      setError('error: auth/email-already-in-use.');
      setMessage('');
    }else{
      setError(err.message);
      setMessage('');
      resetInput();
    }
  }finally{
    setSubmitting(false);
  }
},[firstName, lastName, email, password, resetInput]);

const handleBack = useCallback(() => { // back sa login page
  navigate('/login');
},[navigate]);

const passwordOnChange = (e) => { // password input
  const val = e.target.value;
  setPassword(val);

  if (!val){
    setIsChecked(false);
  }
}

const checkPassword = () =>{ // checkbox
  setIsChecked(prev => !prev);
}

// -------------------------------------------------------------------

useEffect(() => { // para avoid redirect sa register pagpinalitan ang url
  if(!isAuthLoading && user && !submitting){
    navigate('/dashboard');
  }
},[isAuthLoading,user,submitting]);

// if(isAuthLoading) return spin;
if (isAuthLoading) return <div className={styles.spinner}></div>;
{/* <div className={styles.loadingOverlay}>Loading...</div>; */}

if(user && !submitting) return null;

// -------------------------------------------------------------------

  return(
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>

        {/* container ng loading, error, messages */}
        <div className={styles.statusArea}>

          {/* Loading State */}
          {submitting && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p>Setting up your account...</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className={styles.successMessage}>
              {message} You can 
              <button onClick={handleBack} className={styles.inlineBtn}>go back</button> to Sign in!
            </div>
          )}

          {/* Error Message */}
          {error && <p className={styles.errorMessage}>{error}</p>}

        </div>

        <h4>Register</h4>
        <h6>Create your account by filling up this form.</h6>

        <form className={styles.registerForm}
          onSubmit={handleRegister}
        >
          <span>Last Name:
            <input type="text" placeholder="*Last Name" maxLength={25} 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </span>
          <span>First Name:
            <input type="text" placeholder="*First Name" maxLength={25} 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </span>
          <span>Email:
            <input type="email" placeholder="*Email Address" maxLength={50}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </span>
          <span>Password:
            <input placeholder="*Password"
              value={password}
              type={isChecked ? 'text' : 'password'}
              onChange={passwordOnChange}
            />
          </span>

            <div className={styles.checkboxContainer}>
              <label htmlFor="showPassword">Show password</label>
              <input 
                id="showPassword"
                type="checkbox"  
                checked={isChecked} 
                onChange={checkPassword} 
              />
            </div>

          <button type="submit">Register</button>
        </form>

          <button type="button" className={styles.backBtn}
            onClick={handleBack}
          >
              Back to Sign In
          </button>
      </div>
    </div>
  )
}