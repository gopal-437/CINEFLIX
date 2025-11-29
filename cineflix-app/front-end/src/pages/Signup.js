import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Signup.module.css'; // Adjust the import path as needed
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const navigate = useNavigate();

  const { setLoading
  } = AppContextProvider();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission

  const newErrors = {};
  let hasErrors = false;

  // Validate each field
  Object.keys(formData).forEach(key => {
    const error = validateField(key, formData[key]);
    newErrors[key] = error;
    if (error) hasErrors = true;
  });

  if (hasErrors) {
    // Find the first error message to show in alert
    const firstError = Object.values(newErrors).find(error => error);
    alert(`${firstError}`);
    return;
  }

    setLoading(true);
    
    try {

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password, // Your backend should hash this
        fullName: formData.fullName,
        phone: formData.phoneNumber,
        role: "customer", // Default role
        createdAt: new Date(),
        updatedAt: new Date()
      };
  
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/signup/submit-form`, 
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if(response.data.success == false) {
        alert(response.data.message);
        setLoading(false);
        return; 
      }
      
      console.log('Form submitted successfully:', response.data);
      alert('Form submitted successfully!');

      navigate("/login");
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }

    setLoading(false);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers and underscores';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'phoneNumber':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[0-9]{10,15}$/.test(value)) return 'Phone number must be 10-15 digits';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'agreedToTerms':
        if (!value) return 'You must agree to the terms';
        return '';
      default:
        return '';
    }
  };

  return (
    <div className={styles.signupContainer}>
      <form 
        className={`${styles.form} ${isHovered ? styles.formHover : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Create Account</h2>
        
        {/* Two-column layout for name fields */}
        <div className={styles.twoColumn}>
          {/* Full Name */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Full Name</label>
            </div>
            <div className={styles.inputForm}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"/>
              </svg>
              <input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name" 
                className={styles.input} 
                type="text" 
              />
            </div>
          </div>

          {/* Username */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Username</label>
            </div>
            <div className={styles.inputForm}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"/>
              </svg>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username" 
                className={styles.input} 
                type="text" 
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className={styles['flex-column']}>
          <label>Email</label>
        </div>
        <div className={styles.inputForm}>
          <svg width="16" viewBox="0 0 32 32" height="16">
            <path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z"/>
          </svg>
          <input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address" 
            className={styles.input} 
            type="email" 
          />
        </div>

        {/* Phone Number */}
        <div className={styles['flex-column']}>
          <label>Phone Number</label>
        </div>
        <div className={styles.inputForm}>
          <svg width="16" viewBox="0 0 24 24" height="16">
            <path d="M20 22.621l-3.521-3.52a10.9 10.9 0 0 0 1.414-1.414l3.52 3.521zM7.825 15.997l-3.52-3.521 3.521-3.52a10.9 10.9 0 0 0 1.414 1.414zM17.5 2c1.934 0 3.5 1.566 3.5 3.5v14c0 1.934-1.566 3.5-3.5 3.5h-11c-1.934 0-3.5-1.566-3.5-3.5v-14c0-1.934 1.566-3.5 3.5-3.5h11zm-6 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
          <input 
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone number" 
            className={styles.input} 
            type="tel" 
          />
        </div>

        {/* Two-column layout for passwords */}
        <div className={styles.twoColumn}>
          {/* Password */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Password</label>
            </div>
            <div className={styles.inputForm}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password" 
                className={styles.input} 
                type="password" 
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Confirm</label>
            </div>
            <div className={styles.inputForm}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
              <input 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm" 
                className={styles.input} 
                type="password" 
              />
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className={styles.checkboxContainer}>
          <input 
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            type="checkbox" 
            id="terms" 
            className={styles.checkbox} 
          />
          <label htmlFor="terms">I agree to the <span className={styles.span}>Terms</span> and <span className={styles.span}>Privacy Policy</span></label>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles['button-submit']} >Sign Up</button>

        {/* Login Link */}
        <p className={styles.p}>Already have an account? <span className={styles.span} onClick={() => {navigate('/login')}}>Log In</span></p>
      </form>
    </div>
  );
};

export default SignupPage;