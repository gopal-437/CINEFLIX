import React, { useEffect, useState } from 'react';
import styles from '../styles/UserProfile.module.css';
import { useSelector } from 'react-redux';
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");

  const userEmail = useSelector((state) => state.appContext.userEmail);
  const loading  = useSelector((state) => state.appContext.loading);

  const {setLoading, setUserEmail} = AppContextProvider();

  const fetchProfileDetails = async() => {
    setLoading(true);
    try {

        const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/getprofiledata`);
  
        if (userEmail) url.searchParams.append('userEmail', userEmail);
  
        // Fetch movies data from API with the constructed URL
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUserId(data._id);

        setUser({
          username: data.username,
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          role: data.role
        });
      } catch (error) {
        console.error('Error fetching profile details:', error);
      }
      setLoading(false);
  }

  useEffect(() => {
    fetchProfileDetails();
  },[])

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log("name and vaue",name,value);
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveClickHandler = async () => {
    setLoading(true);

    try
    {
      //sending new data 

      // Make POST request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/postprofiledata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...user,_id: userId})
      });

      if (!response.ok) {
        throw new Error('edit profile failed');
      }

      const result = await response.json();

      if(!result.success)
      {
           alert(result.message);
      }

      else{

      setUser({
          username: result.username,
          email: result.email,
          password: result.password,
          fullName: result.fullName,
          phone: result.phone,
          role: result.role
        });

      alert(result.message);
      setUserEmail(result.userData.email);
      setUser(result.userData);

      setIsEditing(!isEditing);

      }

    } catch (error) {
      console.error('Error fetching profile details:', error);
    }

    setLoading(false);
   
  }

  const toggleEdit = async () => { // calling fetch profile details to reset data on cancel
    await fetchProfileDetails();
    setIsEditing(!isEditing);
  };

  if(!user) return <></>;

  return (
    <div className={styles.profileContainer}>
      <div className={`${styles.profileCard} ${isEditing ? styles.editing : ''}`}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <span>{user.fullName.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className={styles.username}>{user.username}</h2>
          <span className={styles.role}>{user.role}</span>
        </div>

        <div className={styles.profileDetails}>

        <div className={styles.detailItem}>
            <label>UserName</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              <p>{user.username}</p>
            )}
          </div>

          <div className={styles.detailItem}>
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={user.fullName}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              <p>{user.fullName}</p>
            )}
          </div>

          <div className={styles.detailItem}>
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              <p>{user.email}</p>
            )}
          </div>

          <div className={styles.detailItem}>
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              <p>{user.phone}</p>
            )}
          </div>

          {isEditing && (
            <div className={styles.detailItem}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                className={styles.editInput}
                placeholder="Enter new password"
              />
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={isEditing ? saveClickHandler : toggleEdit}
            className={`${styles.editButton} ${isEditing ? styles.saveButton : ''}`}
          >
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
          
          {isEditing && (
            <button
              onClick={toggleEdit}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;