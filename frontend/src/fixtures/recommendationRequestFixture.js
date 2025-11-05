const recommendationRequestFixture = {
  oneRequest: [
    {
      id: 1,
      requesteremail: "requester@ucsb.edu",
      professoremail: "professor@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-01-02T12:00:00",
      dateNeeded: "2022-01-02T12:30:00",
      done: true,
    },
  ],
  threeRequests: [
    {
      id: 1,
      requesteremail: "bob@ucsb.edu",
      professoremail: "profjessie@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-01-02T12:30:00",
      dateNeeded: "2022-02-02T12:00:00",
      done: true,
    },
    {
      id: 2,
      requesteremail: "jane@ucsb.edu",
      professoremail: "profevan@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-01-02T12:00:00",
      dateNeeded: "2022-01-02T12:30:00",
      done: false,
    },
    {
      id: 3,
      requesteremail: "greg@ucsb.edu",
      professoremail: "proftam@ucsb.edu",
      explanation: "explanation",
      dateRequested: "2022-02-02T12:00:00",
      dateNeeded: "2022-03-02T12:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixture };
