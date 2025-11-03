import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ArticlesCreatePage({ storybook = false }) {
  const objectToAxiosParams = (article) => {
    // Convert dateAdded from datetime-local format (YYYY-MM-DDTHH:mm) to ISO format with seconds (YYYY-MM-DDTHH:mm:ss)
    let dateAdded = article.dateAdded;
    if (dateAdded && !dateAdded.includes(":")) {
      // If no time part, add default time
      dateAdded = dateAdded + "T00:00:00";
    } else if (dateAdded && dateAdded.match(/T\d{2}:\d{2}$/)) {
      // If format is YYYY-MM-DDTHH:mm (without seconds), add :00
      dateAdded = dateAdded + ":00";
    }
    return {
      url: "/api/articles/post",
      method: "POST",
      params: {
        title: article.title,
        url: article.url,
        explanation: article.explanation,
        email: article.email,
        dateAdded: dateAdded,
      },
    };
  };

  const onSuccess = (article) => {
    toast(
      `New article Created - id: ${article.id} title: ${article.title}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/articles/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Article</h1>
        <ArticlesForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}

