import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PetRoom.css";

const PetRoom = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWeaponOptions, setShowWeaponOptions] = useState(false);

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

  const backgroundImage = `/assets/${pet.type.toLowerCase()}_${pet.weapon ? pet.weapon.toLowerCase() : "default"}.webp`;

  const handleAction = async (action: string, weapon?: string) => {
    try {
      const response = await fetch(`http://localhost:8080/pets/${id}?action=${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: weapon ? JSON.stringify({ weapon }) : null,
      });

      if (!response.ok) {
        throw new Error("Action failed");
      }

      const updatedPet = await response.json();
      setPet(updatedPet);
      setShowWeaponOptions(false); // Hide weapon options after selection
    } catch (err: any) {
      console.error(err.message);
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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pet-info">
        <h2>{pet.name}</h2>
        <p>Energy: {pet.energy}%</p>
        <p>Mood: {pet.mood}</p>
        <p>Weapon: {pet.weapon || "None"}</p>
      </div>
      <div className="action-buttons">
        <button onClick={() => handleAction("play")}>Play</button>
        <button onClick={() => handleAction("feed")}>Feed</button>
        <button onClick={() => handleAction("sleep")}>Sleep</button>
        <button onClick={() => setShowWeaponOptions(!showWeaponOptions)}>
          Change Weapon
        </button>
      </div>
      {showWeaponOptions && renderWeaponOptions()}
    </div>
  );
};

export default PetRoom;
