import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequestForm({
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

  const testIdPrefix = "RecommendationRequestForm";

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
        <Form.Label htmlFor="requesteremail">RequesterEmail</Form.Label>
        <Form.Control
          id="requesteremail"
          type="text"
          isInvalid={Boolean(errors.requesteremail)}
          {...register("requesteremail", {
            required: "Requester email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesteremail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professoremail">ProfessorEmail</Form.Label>
        <Form.Control
          id="professoremail"
          type="text"
          isInvalid={Boolean(errors.professoremail)}
          {...register("professoremail", {
            required: "Professor email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professoremail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          id="explanation"
          type="text"
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateRequested">
          DateRequested (iso format)
        </Form.Label>
        <Form.Control
          id="dateRequested"
          type="datetime-local"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateRequested", {
            required: true,
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateRequested && "Date requested is required. "}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateNeeded">DateNeeded (iso format)</Form.Label>
        <Form.Control
          id="dateNeeded"
          type="datetime-local"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateNeeded", {
            required: true,
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateNeeded && "Date needed is required. "}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="done">Done?</Form.Label>
        <Form.Check
          id="done"
          type="checkbox"
          label="Done"
          isInvalid={Boolean(errors.done)}
          {...register("done", {
            required: "This is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.done?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit">{buttonLabel}</Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default RecommendationRequestForm;
