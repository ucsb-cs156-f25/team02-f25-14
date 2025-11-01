const menuItemReviewFixtures = {
  oneReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "cguacho@ucsb.edu",
    stars: 4,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "Delicious",
  },
  threeReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "cguacho@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "Delicious",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "dguacho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-02-02T12:00:00",
      comments: "Average",
    },
    {
      id: 3,
      itemId: 3,
      reviewerEmail: "eguacho@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-03-02T12:00:00",
      comments: "Spectacular",
    },
  ],
};

export { menuItemReviewFixtures };