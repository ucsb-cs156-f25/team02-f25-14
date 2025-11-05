const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    teamId: "team02",
    tableOrBreakoutRoom: "5",
    requestTime: "2025-10-29T12:30:00",
    explanation: "Need help with a merge conflict",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "5",
      requestTime: "2025-10-29T12:30:00",
      explanation: "Need help with Dokku",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team03",
      tableOrBreakoutRoom: "3",
      requestTime: "2025-10-29T14:00:00",
      explanation: "Having trouble with PostgreSQL migrations",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "team04",
      tableOrBreakoutRoom: "1",
      requestTime: "2025-10-30T09:45:00",
      explanation: "Need help understanding CRUD controller setup",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
