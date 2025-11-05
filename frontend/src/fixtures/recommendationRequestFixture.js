const recommendationRequestFixture = {
  oneRequest: [
    {
      id: 1,
      requesterEmail: "requester@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-01-02T12:00:00",
      dateNeeded: "2022-01-02T12:30:00",
      done: true,
    },
  ],
  threeRequests: [
    {
      id: 1,
      requesterEmail: "bob@ucsb.edu",
      professorEmail: "profjessie@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-01-02T12:30:00",
      dateNeeded: "2022-02-02T12:00:00",
      done: true,
    },
    {
      id: 2,
      requesterEmail: "jane@ucsb.edu",
      professorEmail: "profevan@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-01-02T12:00:00",
      dateNeeded: "2022-01-02T12:30:00",
      done: false,
    },
    {
      id: 3,
      requesterEmail: "greg@ucsb.edu",
      professorEmail: "proftam@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-02-02T12:00:00",
      dateNeeded: "2022-03-02T12:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixture };
