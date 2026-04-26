export const navigationData = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Option1",
      url: "/admin",
      items: [
        { title: "Dashboard", url: "/admin/dashboard" },
        { title: "Accounts", url: "/admin/users" },
        // { title: "Attendance Records", url: "/admin/attendance-records" },
      ],
    },
    {
      title: "Option2",
      url: "/admin",
      items: [
        // { title: "Dashboard", url: "/admin/dashboard" },
        // { title: "Accounts", url: "/admin/users" },
        { title: "Attendance Records", url: "/admin/attendance-records" },
        { title: "Scheduler", url: "/admin/user-schedule" },
      ],
    },
    {
      title: "Warehouse Management",
      url: "/admin",
      items: [
        { title: "Inventory Items", url: "/admin/inventory" },
        { title: "Suppliers", url: "/admin/suppliers" },
        { title: "Purchase Orders", url: "/admin/purchase-orders" },
        { title: "Warehouse Monitoring", url: "/admin/warehouses" },
      ],
    },
    // {
    //   title: "test",
    //   url: "/admin",
    // },
  ],
};
