import { useState, useMemo } from 'react';
import axios from 'axios';
import styles from '../styles/Signup.module.css'; 
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; 
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
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: ''
  });
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
    agreedToTerms: false
  });

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
        if (!/^[0-9]{10}$/.test(value)) return 'Phone number must be 10 digits';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'agreedToTerms':
        if (!value) return 'You must agree to the terms';
        return '';
      default:
        return '';
    }
  };

  const navigate = useNavigate();
  const { setLoading } = AppContextProvider();

  // Check if form is valid using useMemo for performance
  const isFormValid = useMemo(() => {
    return Object.keys(formData).every(key => {
      const error = validateField(key, formData[key]);
      return error === ''; // No error means field is valid
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validate field immediately after change if it's been touched
    if (touched[name]) {
      const error = validateField(name, type === 'checkbox' ? checked : value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate the field
    const error = validateField(name, type === 'checkbox' ? checked : value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      newErrors[key] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);

    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors).find(key => newErrors[key]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phoneNumber,
        role: "customer", 
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

  // Helper function to determine input class
  const getInputClass = (fieldName) => {
    return `${styles.inputForm} ${touched[fieldName] && errors[fieldName] ? styles.inputError : ''}`;
  };

  // Helper function to determine button class
  const getButtonClass = () => {
    return `${styles['button-submit']} ${!isFormValid ? styles.buttonDisabled : ''}`;
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
            <div className={getInputClass('fullName')}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"/>
              </svg>
              <input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full name" 
                className={styles.input} 
                type="text" 
              />
            </div>
            {touched.fullName && errors.fullName && (
              <div className={styles.errorMessage}>{errors.fullName}</div>
            )}
          </div>

          {/* Username */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Username</label>
            </div>
            <div className={getInputClass('username')}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"/>
              </svg>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Username" 
                className={styles.input} 
                type="text" 
              />
            </div>
            {touched.username && errors.username && (
              <div className={styles.errorMessage}>{errors.username}</div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className={styles['flex-column']}>
          <label>Email</label>
        </div>
        <div className={getInputClass('email')}>
          <svg width="16" viewBox="0 0 32 32" height="16">
            <path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z"/>
          </svg>
          <input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email address" 
            className={styles.input} 
            type="email" 
          />
        </div>
        {touched.email && errors.email && (
          <div className={styles.errorMessage}>{errors.email}</div>
        )}

        {/* Phone Number */}
        <div className={styles['flex-column']}>
          <label>Phone Number</label>
        </div>
        <div className={getInputClass('phoneNumber')}>
          <svg width="16" viewBox="0 0 24 24" height="16">
            <path d="M20 22.621l-3.521-3.52a10.9 10.9 0 0 0 1.414-1.414l3.52 3.521zM7.825 15.997l-3.52-3.521 3.521-3.52a10.9 10.9 0 0 0 1.414 1.414zM17.5 2c1.934 0 3.5 1.566 3.5 3.5v14c0 1.934-1.566 3.5-3.5 3.5h-11c-1.934 0-3.5-1.566-3.5-3.5v-14c0-1.934 1.566-3.5 3.5-3.5h11zm-6 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
          <input 
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Phone number" 
            className={styles.input} 
            type="tel" 
          />
        </div>
        {touched.phoneNumber && errors.phoneNumber && (
          <div className={styles.errorMessage}>{errors.phoneNumber}</div>
        )}

        {/* Two-column layout for passwords */}
        <div className={styles.twoColumn}>
          {/* Password */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Password</label>
            </div>
            <div className={getInputClass('password')}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Password" 
                className={styles.input} 
                type="password" 
              />
            </div>
            {touched.password && errors.password && (
              <div className={styles.errorMessage}>{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.columnField}>
            <div className={styles['flex-column']}>
              <label>Confirm</label>
            </div>
            <div className={getInputClass('confirmPassword')}>
              <svg width="16" viewBox="0 0 24 24" height="16">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
              <input 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm" 
                className={styles.input} 
                type="password" 
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className={styles.errorMessage}>{errors.confirmPassword}</div>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className={styles.checkboxContainer}>
          <input 
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            onBlur={handleBlur}
            type="checkbox" 
            id="terms" 
            className={`${styles.checkbox} ${touched.agreedToTerms && errors.agreedToTerms ? styles.checkboxError : ''}`} 
          />
          <label htmlFor="terms">I agree to the <span className={styles.span}>Terms</span> and <span className={styles.span}>Privacy Policy</span></label>
        </div>
        {touched.agreedToTerms && errors.agreedToTerms && (
          <div className={styles.errorMessage}>{errors.agreedToTerms}</div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className={getButtonClass()}
          disabled={!isFormValid}
        >
          Sign Up
        </button>

        {/* Login Link */}
        <p className={styles.p}>Already have an account? <span className={styles.span} onClick={() => {navigate('/login')}}>Log In</span></p>
      </form>
    </div>
  );
};

export default SignupPage;