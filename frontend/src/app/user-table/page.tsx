import { useState, useEffect } from "react";
import { userColumns, type Users } from "./columns";
import { DataTable } from "./data-table";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // replace with your API
  withCredentials: true, // to send cookies (refresh token)
});

// function getData(): Promise<Payment[]> {
//   // Simulate API fetch
//   return new Promise((resolve) =>
//     resolve([
//       {
//         id: "m5gr84i9",
//         amount: 316,
//         status: "success",
//         email: "ken99@example.com",
//       },
//       {
//         id: "3u1reuv4",
//         amount: 242,
//         status: "success",
//         email: "Abe45@example.com",
//       },
//       {
//         id: "derv1ws0",
//         amount: 837,
//         status: "processing",
//         email: "Monserrat44@example.com",
//       },
//       {
//         id: "5kma53ae",
//         amount: 874,
//         status: "success",
//         email: "Silas22@example.com",
//       },
//       {
//         id: "bhqecj4p",
//         amount: 721,
//         status: "failed",
//         email: "carmella@example.com",
//       },
//       {
//         id: "m5gr84i9",
//         amount: 316,
//         status: "success",
//         email: "ken99@example.com",
//       },
//       {
//         id: "3u1reuv4",
//         amount: 242,
//         status: "success",
//         email: "Abe45@example.com",
//       },
//       {
//         id: "derv1ws0",
//         amount: 837,
//         status: "processing",
//         email: "Monserrat44@example.com",
//       },
//       {
//         id: "5kma53ae",
//         amount: 874,
//         status: "success",
//         email: "Silas22@example.com",
//       },
//       {
//         id: "bhqecj4p",
//         amount: 721,
//         status: "failed",
//         email: "carmella@example.com",
//       },
//       {
//         id: "m5gr84i9",
//         amount: 316,
//         status: "success",
//         email: "ken99@example.com",
//       },
//       {
//         id: "3u1reuv4",
//         amount: 242,
//         status: "success",
//         email: "Abe45@example.com",
//       },
//       {
//         id: "derv1ws0",
//         amount: 837,
//         status: "processing",
//         email: "Monserrat44@example.com",
//       },
//       {
//         id: "5kma53ae",
//         amount: 874,
//         status: "success",
//         email: "Silas22@example.com",
//       },
//       {
//         id: "bhqecj4p",
//         amount: 721,
//         status: "failed",
//         email: "carmella@example.com",
//       },
//     ])
//   );
// }
export async function getUsers(): Promise<Users[]> {
  try {
    const response = await API.get("/api/users/get-all-users");
    if (response.status === 200) {
      return response.data as Users[];
    }
    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export function DemoPage() {
  // const [data, setData] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Users[]>([]);

  console.log("users", users);

  useEffect(() => {
    // getData()
    //   .then((fetchedData) => setData(fetchedData))
    //   .catch((error) => {
    //     console.error("Failed to fetch data:", error);
    //   });

    getUsers()
      .then((fetchedUsers) => setUsers(fetchedUsers))
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={userColumns} data={users} />
    </div>
  );
}

// TODO : remove comments
