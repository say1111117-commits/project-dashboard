import styles from "../styling/About.module.css"

export default function About(){
  return(
    <div className={styles.aboutContainer}>
      <div className={styles.headArea}>
        <span>About This Project</span>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.infoArea}>
          <h3>Hello! My name is Brennan</h3>
          <p>
            Welcome to my dashboard project. Feel free to explore and try out the features at your convenience. 
          </p>
          <p>
            Please note that since you’ve just created your account, your role is currently set to 
            <span className={styles.goldText}> "User" </span> by default. 
            If you need added access or permissions, feel free to reach out.
          </p>
        </div>

        <div className={styles.sdkComparison}>
          <h4 className={styles.goldText}>Dual SDK Integration</h4>
          <p className={styles.smallText}>
            This project utilizes two distinct <strong>Firebase SDK Services</strong> working in sync:
          </p>
          
          <div className={styles.cardGrid}>
            <div className={styles.sdkCard}>
              <h5>1. Firebase Authentication</h5>
              <p>Handles the <strong>Security Layer</strong>. It manages user credentials (Email/Password) and secure login sessions.</p>
            </div>
            <div className={styles.sdkCard}>
              <h5>2. Cloud Firestore</h5>
              <p>Handles the <strong>Data Layer</strong>. It stores the extended user profiles like First Name, Last Name, and Roles.</p>
            </div>
          </div>
        </div>

        {/* Technical Note */}
        <div className={styles.noteArea}>
          <div className={styles.noteHeader}>
            <span className={styles.icon}>⚠️</span> Technical Constraint
          </div>
          <p>
            <strong>Password and Email updates</strong> are intentionally handled via the 
            Firebase Console. 
          </p>
          <p className={styles.smallText}>
            This approach prevents desynchronization between the two SDK services, ensuring that 
            what you see in the Firestore database always matches the actual Auth credentials.
          </p>
        </div>
      </div>
    </div>
  )
}