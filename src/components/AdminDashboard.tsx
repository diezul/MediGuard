import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const usersQuery = query(collection(db, "users"), where("role", "!=", "admin"));
      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  const handleAddAdmin = async () => {
    const usersQuery = query(collection(db, "users"), where("email", "==", newAdminEmail));
    const querySnapshot = await getDocs(usersQuery);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), { role: "admin" });
      alert(`${newAdminEmail} has been made an admin.`);
      setNewAdminEmail("");
      // Refresh users list
      const updatedUsers = users.filter((user) => user.id !== userDoc.id);
      setUsers(updatedUsers);
    } else {
      alert("User not found. Please check the email address.");
    }
  };

  const handleMakePharmacist = async (userId: string) => {
    await updateDoc(doc(db, "users", userId), { role: "pharmacist" });
    // Update local state
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, role: "pharmacist" } : user
    );
    setUsers(updatedUsers);
  };

  return (
    <div className="admin-dashboard p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Add New Admin</h3>
        <input
          type="email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          placeholder="New Admin Email"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAddAdmin} className="bg-blue-500 text-white p-2 rounded">
          Add Admin
        </button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">User Management</h3>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{user.fullName} ({user.email})</span>
              {user.role !== "pharmacist" && (
                <button
                  onClick={() => handleMakePharmacist(user.id)}
                  className="bg-green-500 text-white p-1 rounded"
                >
                  Make Pharmacist
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;