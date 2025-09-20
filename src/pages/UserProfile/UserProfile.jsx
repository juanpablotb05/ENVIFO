import React from "react";
import "./UserProfile.css"; 

 function UserProfile() {
  return (
    <section className="profile-section">
      <div className="profile-header" />

      <div className="profile-card">
        <div className="profile-img-container">
          <img
            src="https://demos.creative-tim.com/material-tailwind-kit-react/img/team-2.jpg"
            alt="profile"
            className="profile-img"
          />
        </div>

        <div className="profile-info">
          <h3 className="profile-name">Jenna Stones</h3>
          <p className="profile-email">jena@mail.com</p>

          <div className="profile-details">
            <p><i className="fas fa-map-marker-alt mr-2 text-blue-500"></i> Los Angeles, California</p>
            <p><i className="fas fa-briefcase mr-2 text-blue-500"></i> Solution Manager - Creative Tim Officer</p>
            <p><i className="fas fa-university mr-2 text-blue-500"></i> University of Computer Science</p>
          </div>

          <button className="show-more-btn">SHOW MORE</button>
        </div>

        <div className="profile-stats">
          <div>
            <p className="stat-number">22</p>
            <p className="stat-label">Friends</p>
          </div>
          <div>
            <p className="stat-number">10</p>
            <p className="stat-label">Photos</p>
          </div>
          <div>
            <p className="stat-number">89</p>
            <p className="stat-label">Comments</p>
          </div>
          <button className="connect-btn">Edit Profile</button>
        </div>
      </div>
    </section>
  );
}

export default UserProfile;

