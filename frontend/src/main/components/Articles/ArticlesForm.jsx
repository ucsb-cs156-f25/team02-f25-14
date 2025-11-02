import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function ArticlesForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "ArticlesForm";

  // For ISO-like date/time validation (matches variants used elsewhere in project)
  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="title">Title</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-title"}
          id="title"
          type="text"
          isInvalid={Boolean(errors.title)}
          {...register("title", {
            required: "Title is required.",
            maxLength: { value: 200, message: "Max length 200 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.title?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="url">URL</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-url"}
          id="url"
          type="text"
          isInvalid={Boolean(errors.url)}
          {...register("url", {
            required: "URL is required.",
            maxLength: { value: 500, message: "Max length 500 characters" },
            pattern: {
              value: /^(https?:\/\/).+/i,
              message: "URL must start with http:// or https://",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.url?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          data-testid={testIdPrefix + "-explanation"}
          id="explanation"
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            maxLength: { value: 2000, message: "Max length 2000 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="email">Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-email"}
          id="email"
          type="email"
          isInvalid={Boolean(errors.email)}
          {...register("email", {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
              message: "Must be a valid email address",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateAdded">Date Added (ISO)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateAdded"}
          id="dateAdded"
          type="datetime-local"
          isInvalid={Boolean(errors.dateAdded)}
          {...register("dateAdded", {
            required: "DateAdded is required.",
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateAdded && "DateAdded is required and must be in ISO format."}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default ArticlesForm;
