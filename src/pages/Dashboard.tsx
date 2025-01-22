import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [pets, setPets] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState("");
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  useEffect(() => {
    const endpoint = isAdmin
      ? "http://localhost:8080/pets/getAllPets"
      : "http://localhost:8080/pets/getPetsByOwner";

    const params = isAdmin ? {} : { ownerId: localStorage.getItem("userId") };

    console.log(isAdmin);
    console.log("Endpoint cridat:", endpoint);


    axios
      .get(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setPets(response.data);
        setError(null);
      })
      .catch((err) => {
        setError(
          "Error fetching pets: " + (err.response?.data?.message || err.message)
        );
      });
  }, [isAdmin]);

  const handlePetClick = (id: number) => {
    navigate(`/pets/${id}`);
  };

  const handleCreatePet = () => {
    const userId = parseInt(localStorage.getItem("userId") || "0", 10);
    if (!userId || !newPetName || !newPetType) {
      setError("Please fill out all fields.");
      return;
    }

    axios
      .post(
        "http://localhost:8080/pets/create",
        { name: newPetName, type: newPetType, ownerId: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setPets((prevPets) => [...prevPets, response.data]);
        setNewPetName("");
        setNewPetType("");
        setError(null);
      })
      .catch((err) => {
        setError("Error creating pet: " + (err.response?.data?.message || err.message));
      });
  };

  const getImagePath = (type: string, weapon: string | null) => {
    const typeToImageMap = {
      STARWARS: {
        Pistol: "starwars_pistol.png",
        "Machine Gun": "starwars_machine_gun.png",
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
        {pets.map((pet) => {
          const imagePath = `/assets/${getImagePath(pet.type, pet.weapon)}`;

          return (
            <div key={pet.id} className="pet-card" onClick={() => handlePetClick(pet.id)}>
              <h2 className="pet-name">{pet.name}</h2>
              <img src={imagePath} alt={`${pet.type} - ${pet.weapon}`} className="pet-image" />
              <div className="progress-container">
                <div className="progress-bar">
                  <span className="energy-bar" style={{ width: `${pet.energy}%` }}>
                    {pet.energy}%
                  </span>
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <span className="mood-bar" style={{ width: `${pet.mood === "HAPPY" ? 100 : 50}%` }}>
                    {pet.mood}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="pet-card">
          <h2 className="pet-name">Create a new Warrior</h2>
          <input
            type="text"
            placeholder="Warrior Name"
            value={newPetName}
            onChange={(e) => setNewPetName(e.target.value)}
          />
          <select
            value={newPetType}
            onChange={(e) => setNewPetType(e.target.value)}
            className="pet-type-select"
          >
            <option value="" disabled>
              Select Warrior Type
            </option>
            <option value="STARWARS">STARWARS</option>
            <option value="LORDRINGS">LORDRINGS</option>
          </select>
          <button onClick={handleCreatePet}>Create Warrior</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
