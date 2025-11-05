import React from "react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestForm",
  component: HelpRequestForm,
};

const Template = (args) => <HelpRequestForm {...args} />;

export const Create = Template.bind({});
Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit clicked with data:", data);
    window.alert("Submit clicked with data: " + JSON.stringify(data, null, 2));
  },
};

export const Update = Template.bind({});
Update.args = {
  initialContents: helpRequestFixtures.oneHelpRequest,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit clicked with data:", data);
    window.alert("Submit clicked with data: " + JSON.stringify(data, null, 2));
  },
};
