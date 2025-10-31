import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="HelpRequestForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-requesterEmail"
              id="requesterEmail"
              type="email"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester Email is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team ID</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-teamId"
              id="teamId"
              type="text"
              isInvalid={Boolean(errors.teamId)}
              {...register("teamId", {
                required: "Team ID is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.teamId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">
              Table/Breakout Room
            </Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-tableOrBreakoutRoom"
              id="tableOrBreakoutRoom"
              type="text"
              isInvalid={Boolean(errors.tableOrBreakoutRoom)}
              {...register("tableOrBreakoutRoom", {
                required: "Table or Breakout Room is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tableOrBreakoutRoom?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">Request Time</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-requestTime"
              id="requestTime"
              type="datetime-local"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: "Request Time is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-explanation"
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
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3" controlId="solved">
            <Form.Check
              data-testid="HelpRequestForm-solved"
              type="checkbox"
              label="Solved"
              {...register("solved")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="HelpRequestForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            data-testid="HelpRequestForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default HelpRequestForm;
