import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PetRoom.css";

const PetRoom = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWeaponOptions, setShowWeaponOptions] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await fetch(`http://localhost:8080/pets/getPet/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pet data");
        }

        const data = await response.json();
        setPet(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchPet();
  }, [id]);

  const getVideoOrImageForAction = (action?: string) => {
    if (!pet) return action ? "" : "/assets/default.png";

    const type = pet.type?.toLowerCase() || "default";
    const weapon = pet.weapon?.toLowerCase().replace(" ", "_") || "default";

    if (action) {
      return `/assets/videos/${type}_${weapon}_${action}.mp4`;
    }

    return `/assets/${type}_${weapon}.png`;
  };

  const handleAction = async (action: string, weapon?: string) => {
      if (action === "changeWeapon" && weapon) {
            try {
            const url = `http://localhost:8080/pets/${id}?action=${action}&newWeapon=${weapon}`;
            const response = await fetch(url, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });

            if (!response.ok) {
              throw new Error("Action failed");
            }

            const updatedPet = await response.json();
            setPet(updatedPet);
            setShowWeaponOptions(false);
          } catch (err: any) {
            setError("Failed to perform action. Please try again.");
          }
          return;
      }

      const video = getVideoOrImageForAction(action);
      setVideoSrc(video);
      setIsPlayingVideo(true);

      setTimeout(() => {
        setIsPlayingVideo(false);
        setVideoSrc(null);
      }, 5000);

      try {
        const url = weapon
          ? `http://localhost:8080/pets/${id}?action=${action}&newWeapon=${weapon}`
          : `http://localhost:8080/pets/${id}?action=${action}`;

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Action failed");
        }

        const updatedPet = await response.json();
          setPet(updatedPet);
          setShowWeaponOptions(false);
      } catch (err: any) {
          setError("Failed to perform action. Please try again.");
      }
  };


    const renderWeaponOptions = () => {
        const weaponOptions = pet.type === "STARWARS"
            ? ["Pistol", "Machine Gun", "Lightsaber"]
            : ["Sword", "Axe", "Bow"];

      return (
        <div className="weapon-options">
          {weaponOptions.map((weapon) => (
            <button
              key={weapon}
              className="weapon-button"
              onClick={() => handleAction("changeWeapon", weapon)}
            >
              <img
                src={`/assets/icons/${weapon.toLowerCase().replace(" ", "_")}.png`}
                alt={weapon}
              />
            </button>
          ))}
        </div>
      );
    };

  const handleDeletePet = async () => {
    try {
      const response = await fetch(`http://localhost:8080/pets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete pet");
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Failed to delete pet. Please try again.");
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!pet) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pet-room">
      {isPlayingVideo && videoSrc ? (
        <div className="video-container">
          <video src={videoSrc} autoPlay className="video-player" />
            <button className="back-button" onClick={() => navigate("/dashboard")}>
              <img src="/assets/icons/back.png" alt="Back" />
            </button>

            <button className="delete-button" onClick={handleDeletePet}>
              <img src="/assets/icons/delete.png" alt="delete" className="action-icon" />
            </button>
        </div>
      ) : (
        <div className="video-container">
          <img
            src={getVideoOrImageForAction()}
            alt="Pet"
            className="pet-image"
          />
          <button className="back-button" onClick={() => navigate("/dashboard")}>
              <img src="/assets/icons/back.png" alt="Back" />
          </button>

          <button className="delete-button" onClick={handleDeletePet}>
             <img src="/assets/icons/delete.png" alt="delete" className="action-icon" />
          </button>
        </div>
      )}

      <div className="pet-info">
        <h2>{pet.name}</h2>
        <div className="progress-container">
          <h3>Energy</h3>
          <div className="progress-bar">
            <span
              className="energy-bar"
              style={{ width: `${pet.energy}%` }}
            >
              {pet.energy}%
            </span>
          </div>
        </div>
        <div className="progress-container">
          <h3>Mood</h3>
          <div className="mood-bar">
            {["HAPPY", "SAD", "ANGRY", "TIRED"].map((mood) => (
              <div
                key={mood}
                className={`mood-segment ${mood.toLowerCase()} ${
                  pet.mood === mood ? "active" : ""
                }`}
                style={{ width: "25%" }}
              >
                {mood}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => handleAction("play")}>
          <img src="/assets/icons/play.png" alt="Play" />
        </button>
        <button onClick={() => handleAction("feed")}>
          <img src="/assets/icons/feed.png" alt="Feed" />
        </button>
        <button onClick={() => handleAction("sleep")}>
          <img src="/assets/icons/sleep.png" alt="Sleep" />
        </button>
        <button onClick={() => setShowWeaponOptions(!showWeaponOptions)}>
          <img src="/assets/icons/change_weapon.png" alt="Change Weapon" />
        </button>
      </div>

      {showWeaponOptions && renderWeaponOptions()}
    </div>
  );
};

export default PetRoom;