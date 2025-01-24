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

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!pet) {
    return <p>Loading...</p>;
  }

  const backgroundImage = `/assets/${pet.type.toLowerCase()}_${
    pet.weapon ? pet.weapon.toLowerCase().replace(" ", "_") : "default"
  }.png`;

  const getVideoForPet = (type: string, weapon: string | null, action: string) => {
    const videoMap: Record<string, Record<string, Record<string, string>>> = {
      STARWARS: {
        Pistol: {
          play: "/assets/videos/starwars_pistol_play.mp4",
          feed: "/assets/videos/starwars_pistol_feed.mp4",
          sleep: "/assets/videos/starwars_pistol_sleep.mp4",
        },
        "Machine Gun": {
          play: "/assets/videos/starwars_machine_gun_play.mp4",
          feed: "/assets/videos/starwars_machine_gun_feed.mp4",
          sleep: "/assets/videos/starwars_machine_gun_sleep.mp4",
        },
        Lightsaber: {
          play: "/assets/videos/starwars_lightsaber_play.mp4",
          feed: "/assets/videos/starwars_lightsaber_feed.mp4",
          sleep: "/assets/videos/starwars_lightsaber_sleep.mp4",
        },
        default: {
          play: "/assets/videos/starwars_default_play.mp4",
          feed: "/assets/videos/starwars_default_feed.mp4",
          sleep: "/assets/videos/starwars_default_sleep.mp4",
        },
      },
      LORDRINGS: {
        Sword: {
          play: "/assets/videos/lordrings_sword_play.mp4",
          feed: "/assets/videos/lordrings_sword_feed.mp4",
          sleep: "/assets/videos/lordrings_sword_sleep.mp4",
        },
        Axe: {
          play: "/assets/videos/lordrings_axe_play.mp4",
          feed: "/assets/videos/lordrings_axe_feed.mp4",
          sleep: "/assets/videos/lordrings_axe_sleep.mp4",
        },
        Bow: {
          play: "/assets/videos/lordrings_bow_play.mp4",
          feed: "/assets/videos/lordrings_bow_feed.mp4",
          sleep: "/assets/videos/lordrings_bow_sleep.mp4",
        },
        default: {
          play: "/assets/videos/lordrings_default_play.mp4",
          feed: "/assets/videos/lordrings_default_feed.mp4",
          sleep: "/assets/videos/lordrings_default_sleep.mp4",
        },
      },
    };

    return videoMap[type]?.[weapon || "default"]?.[action] || "/assets/videos/default.mp4";
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

    const video = getVideoForPet(pet.type, pet.weapon, action);
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

  return (
    <div className="pet-room" style={{
        backgroundImage: isPlayingVideo
          ? "none"
          : `url(${backgroundImage})`,
      }}
    >
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

      <button className="back-button" onClick={() => navigate("/dashboard")}>
        <img src="/assets/icons/back.png" alt="back" className="action-icon" />
      </button>

      <button className="delete-button" onClick={handleDeletePet}>
        <img src="/assets/icons/delete.png" alt="delete" className="action-icon" />
      </button>

      <div className="pet-info">
        <h2>{pet.name}</h2>
        <div className="progress-container">
          <h3 className="progress-title">Energy</h3>
          <div className="progress-bar">
            <span className="energy-bar" style={{ width: `${pet.energy}%` }}> {pet.energy}% </span>
          </div>
          <h3 className="progress-title">Mood</h3>
          <div className="mood-bar">
            {["HAPPY", "SAD", "ANGRY", "TIRED"].map((mood, index) => (
              <div key={index} className={`mood-segment ${mood.toLowerCase()} ${
                  pet.mood === mood ? "active" : ""
                }`}
                style={{ width: "25%" }}
              > {mood}
              </div>
            ))}
          </div>
        </div>
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
