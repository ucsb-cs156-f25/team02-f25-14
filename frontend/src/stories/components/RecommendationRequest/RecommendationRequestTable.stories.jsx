import React from "react";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { recommendationRequestFixture } from "fixtures/recommendationRequestFixture";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/RecommendationRequest/RecommendationRequestTable",
  component: RecommendationRequestTable,
};

const Template = (args) => {
  return <RecommendationRequestTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  recommendationrequest: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  recommendationrequest: recommendationRequestFixture.threeRequests,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  recommendationrequest: recommendationRequestFixture.threeRequests,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/recommendationrequests", () => {
      return HttpResponse.json(
        { message: "Request deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
