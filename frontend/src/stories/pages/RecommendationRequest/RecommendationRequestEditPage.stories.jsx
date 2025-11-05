import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RestaurantEditPage";
import { recommendationRequestFixture } from "fixtures/recommendationRequestFixture";

export default {
  title: "pages/RecommendationRequest/RecommmendationRequestEditPage",
  component: RecommendationRequestEditPage,
};

const Template = () => <RecommendationRequestEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/recommendationrequests", () => {
      return HttpResponse.json(recommendationRequestFixture.threeRequests[0], {
        status: 200,
      });
    }),
    http.put("/api/recommendationrequests", () => {
      //window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json(
        {
          id: 1,
          requesterEmail: "requester@ucsb.edu",
          professorEmail: "professor@ucsb.edu",
          explanation: "explanation",
          dateRequested: "2022-01-02T12:00:00",
          dateNeeded: "2022-01-02T12:30:00",
          done: true,
        },
        { status: 200 },
      );
    }),
  ],
};
