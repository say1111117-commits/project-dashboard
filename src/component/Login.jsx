import { useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef} from 'react'

import { auth } from '../service/firebase.jsx';
import { signInWithEmailAndPassword } from 'firebase/auth'

import styles from '../styling/login.module.css'

export default function Login(){

const navigate = useNavigate();

const [isChecked, setIsChecked] = useState(false);
 
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');

const emailRefocus = useRef(null);

useEffect(() =>{
  emailRefocus.current?.focus();
},[]);

const handleSignin = useCallback(async(e) => {
  e.preventDefault();

  setSubmitting(true);
  setError('');

  try{
    await signInWithEmailAndPassword(auth, email, password);
    navigate('/dashboard');
  }catch (err){
    console.log(err);
    setError('Error: Email or Password is incorrect.');
  }finally{
    setSubmitting(false);
  }
  
},[email, password, navigate]);

const handleRegister = useCallback(()=>{
  navigate('/register');
},[navigate]);

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

  return(
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>

        {/* loading, error, messages, container */}
          <div className={styles.statusArea}>
              {submitting && (
                  <div className={styles.loadingOverlay}>
                      <div className={styles.spinner}></div>
                      <p>Signing in...</p>
                  </div>
              )}
              {error && <p className={styles.errorMessage}>{error}</p>}
          </div>

        <h4>Login</h4>

        <form className={styles.loginForm} onSubmit={handleSignin}>

          <span> Email:
            <input type="email" placeholder="Email Address" maxLength={25}
              ref={emailRefocus}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </span>

          <span>Password:
            <input placeholder="Password" maxLength={25}
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
              onChange={showPassword}
            />
          </div>

            <button type='submit'>Sign In</button>
        </form><br/>

        <div className={styles.registerContainer}>
          Dont have an account?
          <button onClick={handleRegister}>Signup here.</button>
        </div>
      </div>
    </div>
  )
}