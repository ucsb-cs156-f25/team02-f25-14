import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestCreatePage({ storybook = false }) {
  const objectToAxiosParams = (recommendationrequest) => ({
    url: "/api/recommendationrequests/post",
    method: "POST",
    params: {
      requesterEmail: recommendationrequest.requesterEmail,
      professorEmail: recommendationrequest.professorEmail,
      explanation: recommendationrequest.explanation,
      dateRequested: recommendationrequest.dateRequested,
      dateNeeded: recommendationrequest.dateNeeded,
      done: recommendationrequest.done,
    },
  });

  const onSuccess = (recommendationrequest) => {
    toast(
      `New request Created - id: ${recommendationrequest.id} requesteremail: ${recommendationrequest.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/recommendationrequests/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Request</h1>
        <RecommendationRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
