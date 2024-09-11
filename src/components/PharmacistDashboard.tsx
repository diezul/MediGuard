import React, { useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
}

interface Treatment {
  id: string;
  medicationName: string;
  frequency: number;
  administrationTimes: string[];
  startDate: string;
  endDate: string;
}

const PharmacistDashboard: React.FC = () => {
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [newTreatment, setNewTreatment] = useState<Omit<Treatment, "id">>({
    medicationName: "",
    frequency: 1,
    administrationTimes: [""],
    startDate: "",
    endDate: "",
  });

  const searchUser = async () => {
    const usersQuery = query(
      collection(db, "users"),
      where("phoneNumber", "==", searchPhoneNumber),
    );
    const querySnapshot = await getDocs(usersQuery);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      setSelectedUser({ id: userDoc.id, ...userData });
      fetchTreatments(userDoc.id);
    } else {
      alert("User not found. Please check the phone number.");
      setSelectedUser(null);
      setTreatments([]);
    }
  };

  const fetchTreatments = async (userId: string) => {
    const treatmentsQuery = query(
      collection(db, "treatments"),
      where("userId", "==", userId),
    );
    const querySnapshot = await getDocs(treatmentsQuery);
    const fetchedTreatments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Treatment[];
    setTreatments(fetchedTreatments);
  };

  const handleAddTreatment = async () => {
    if (selectedUser) {
      try {
        await addDoc(collection(db, "treatments"), {
          userId: selectedUser.id,
          ...newTreatment,
        });
        alert("Treatment added successfully");
        fetchTreatments(selectedUser.id);
        setNewTreatment({
          medicationName: "",
          frequency: 1,
          administrationTimes: [""],
          startDate: "",
          endDate: "",
        });
      } catch (error) {
        console.error("Error adding treatment:", error);
        alert("Failed to add treatment. Please try again.");
      }
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...newTreatment.administrationTimes];
    newTimes[index] = value;
    setNewTreatment({ ...newTreatment, administrationTimes: newTimes });
  };

  const handleAddTime = () => {
    setNewTreatment({
      ...newTreatment,
      administrationTimes: [...newTreatment.administrationTimes, ""],
    });
  };

  return (
    <div className="pharmacist-dashboard p-4">
      <h2 className="text-2xl font-bold mb-4">Pharmacist Dashboard</h2>
      <div className="mb-4">
        <input
          type="tel"
          value={searchPhoneNumber}
          onChange={(e) => setSearchPhoneNumber(e.target.value)}
          placeholder="Search by Phone Number"
          className="p-2 border rounded mr-2"
        />
        <button
          onClick={searchUser}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Search
        </button>
      </div>
      {selectedUser && (
        <div>
          <h3 className="text-xl font-semibold mb-2">
            User: {selectedUser.fullName}
          </h3>
          <h4 className="text-lg font-semibold mb-2">Current Treatments</h4>
          <ul className="mb-4">
            {treatments.map((treatment) => (
              <li key={treatment.id} className="bg-gray-100 p-2 rounded mb-2">
                <p>Medication: {treatment.medicationName}</p>
                <p>Frequency: {treatment.frequency} times per day</p>
                <p>Times: {treatment.administrationTimes.join(", ")}</p>
                <p>
                  Period: {treatment.startDate} to {treatment.endDate}
                </p>
              </li>
            ))}
          </ul>
          <h4 className="text-lg font-semibold mb-2">Add New Treatment</h4>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="text"
              value={newTreatment.medicationName}
              onChange={(e) =>
                setNewTreatment({
                  ...newTreatment,
                  medicationName: e.target.value,
                })
              }
              placeholder="Medication Name"
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              value={newTreatment.frequency}
              onChange={(e) =>
                setNewTreatment({
                  ...newTreatment,
                  frequency: parseInt(e.target.value),
                })
              }
              placeholder="Frequency (times per day)"
              className="w-full p-2 border rounded"
            />
            {newTreatment.administrationTimes.map((time, index) => (
              <input
                key={index}
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="w-full p-2 border rounded"
              />
            ))}
            <button
              type="button"
              onClick={handleAddTime}
              className="bg-gray-200 text-gray-800 p-2 rounded"
            >
              Add Time
            </button>
            <input
              type="date"
              value={newTreatment.startDate}
              onChange={(e) =>
                setNewTreatment({ ...newTreatment, startDate: e.target.value })
              }
              placeholder="Start Date"
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              value={newTreatment.endDate}
              onChange={(e) =>
                setNewTreatment({ ...newTreatment, endDate: e.target.value })
              }
              placeholder="End Date"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleAddTreatment}
              className="w-full bg-green-500 text-white p-2 rounded"
            >
              Add Treatment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;
