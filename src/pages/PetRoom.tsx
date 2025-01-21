import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importem useNavigate
import "./PetRoom.css";

const PetRoom = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWeaponOptions, setShowWeaponOptions] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false); // Estat per al vídeo
  const [videoSrc, setVideoSrc] = useState<string | null>(null); // Estat per a la font del vídeo
  const navigate = useNavigate(); // Hook per navegar entre pàgines

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

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!pet) {
    return <p>Loading...</p>;
  }

 const backgroundImage = `/assets/${pet.type.toLowerCase()}_${pet.weapon ? pet.weapon.toLowerCase().replace(" ", "_") : "default"}.png`;

  const getVideoForPet = (type: string, weapon: string | null) => {
    const videoMap: Record<string, Record<string, string>> = {
      STARWARS: {
        Pistol: "/assets/videos/starwars_pistol.mp4",
        "Machine Gun": "/assets/videos/starwars_machine_gun.mp4",
        Lightsaber: "/assets/videos/starwars_lightsaber.mp4",
        default: "/assets/videos/starwars_default.mp4",
      },
      LORDRINGS: {
        Sword: "/assets/videos/lordrings_sword.mp4",
        Axe: "/assets/videos/lordrings_axe.mp4",
        Bow: "/assets/videos/lordrings_bow.mp4",
        default: "/assets/videos/lordrings_default.mp4",
      },
    };

    return videoMap[type]?.[weapon || "default"] || "/assets/videos/default.mp4";
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

      alert("Pet deleted successfully.");
      navigate("/dashboard"); // Torna al Dashboard
    } catch (err) {
      setError("Failed to delete pet. Please try again.");
    }
  };



  const handleAction = async (action: string, weapon?: string) => {
    if (action === "play") {
      const video = getVideoForPet(pet.type, pet.weapon);
      setVideoSrc(video);
      setIsPlayingVideo(true);

      setTimeout(() => {
        setIsPlayingVideo(false);
        setVideoSrc(null);
      }, 5000);
    }

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

  return (
    <div
      className="pet-room"
      style={{
        backgroundImage: isPlayingVideo
          ? "none" // Si es reprodueix el vídeo, eliminem la imatge de fons
          : `url(${backgroundImage})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      {/* Mostrem el vídeo si s'està jugant */}
      {isPlayingVideo && videoSrc && (
        <video
          src={videoSrc}
          autoPlay
          muted
          className="video-background"
          onEnded={() => {
            setIsPlayingVideo(false);
            setVideoSrc(null);
          }}
        />
      )}

      {/* Botons per tornar a la pàgina Dashboard i eliminar la mascota*/}
      <button className="back-button" onClick={() => navigate("/dashboard")}>
        Back to your army
      </button>

      <button className="delete-button" onClick={handleDeletePet}>
        Delete Warrior
      </button>

      <div className="pet-info">
        <h2>{pet.name}</h2>
        <p>Energy: {pet.energy}%</p>
        <p>Mood: {pet.mood}</p>
      </div>
     <div className="action-buttons">
          <button onClick={() => handleAction("play")}>
            <img src="/assets/icons/play.png" alt="Play" className="action-icon" />
          </button>
          <button onClick={() => handleAction("feed")}>
            <img src="/assets/icons/feed.png" alt="Feed" className="action-icon" />
          </button>
          <button onClick={() => handleAction("sleep")}>
            <img src="/assets/icons/sleep.png" alt="Sleep" className="action-icon" />
          </button>
          <button onClick={() => setShowWeaponOptions(!showWeaponOptions)}>
            <img src="/assets/icons/change_weapon.png" alt="Change Weapon" className="action-icon" />
          </button>
        </div>
      {showWeaponOptions && renderWeaponOptions()}
    </div>
  );
};

export default PetRoom;
