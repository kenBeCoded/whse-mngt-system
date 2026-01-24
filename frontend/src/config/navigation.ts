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
    // {
    //   title: "test",
    //   url: "/admin",
    // },
  ],
};
