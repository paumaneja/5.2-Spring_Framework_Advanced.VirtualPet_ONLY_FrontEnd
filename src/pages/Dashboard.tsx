import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found");
      return;
    }

    axios
      .get("http://localhost:8080/pets/getPetsByOwner", {
        params: { ownerId: userId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setPets(response.data);
        setError(null);
      })
      .catch((err) => {
        setError("Error fetching pets: " + (err.response?.data?.message || err.message));
      });
  }, []);

  const handlePetClick = (id: number) => {
    navigate(`/pets/${id}`);
  };

const getImagePath = (type: string, weapon: string | null) => {

    const typeToImageMap = {
      STARWARS: {
        Pistol: "starwars_pistol.png",
        "Machine Gun": "starwars_machinegun.png",
        Lightsaber: "starwars_lightsaber.png",
        default: "starwars_default.png",
      },
      LORDRINGS: {
        Sword: "lordrings_sword.png",
        Axe: "lordrings_axe.png",
        Bow: "lordrings_bow.png",
        default: "lordrings_default.png",
      },
    };

    const typeMap = typeToImageMap[type];
    if (!typeMap) {
      return "default.png";
    }

    return typeMap[weapon || "default"] || "default.png";
  };

  return (
    <div className="dashboard">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="pet-container">
        {pets.length > 0 ? (
          pets.map((pet) => {
            const imagePath = `/assets/${getImagePath(pet.type, pet.weapon)}`;

            return (
              <div key={pet.id} className="pet-card" onClick={() => handlePetClick(pet.id)}>
                <h2 className="pet-name">{pet.name}</h2>
                <img src={imagePath} alt={`${pet.type} - ${pet.weapon}`} className="pet-image" />
                <div className="progress-container">
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
                  <div className="progress-bar">
                    <span
                      className="mood-bar"
                      style={{ width: `${pet.mood === "HAPPY" ? 100 : 50}%` }}
                    >
                      {pet.mood}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-pets">
            <p>No pets found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPets;