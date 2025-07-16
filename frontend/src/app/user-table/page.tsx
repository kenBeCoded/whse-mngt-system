import { useState, useEffect } from "react";
import { columns, type Payment } from "./columns";
import { DataTable } from "./data-table";

function getData(): Promise<Payment[]> {
  // Simulate API fetch
  return new Promise((resolve) =>
    resolve([
      {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
      },
      // Add more data as needed
    ])
  );
}

export default function DemoPage() {
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    getData().then((fetchedData) => setData(fetchedData));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}