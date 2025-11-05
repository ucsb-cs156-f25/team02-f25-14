import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { BrowserRouter as Router } from "react-router";

const mockedNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>
    );
    const requesterEmailLabel = await screen.findByText(/Requester Email/);
    const createButton = await screen.findByText(/Create/);

  expect(requesterEmailLabel).toBeInTheDocument();
  expect(createButton).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    const initialContents = {
      id: 5,
      requesterEmail: "test@example.com",
      teamId: "T01",
      tableOrBreakoutRoom: "Table 3",
      requestTime: "2023-09-15T14:00",
      explanation: "Need help with testing",
      solved: true,
    };

    render(
      <Router>
        <HelpRequestForm initialContents={initialContents} />
      </Router>
    );

    expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue("5");
    expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
      "test@example.com"
    );
    expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue("T01");
    expect(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom")
    ).toHaveValue("Table 3");
    expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveValue(
      "2023-09-15T14:00"
    );
    expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveValue(
      "Need help with testing"
    );
    expect(screen.getByTestId("HelpRequestForm-solved")).toBeChecked();
  });

  test("shows correct error messages on bad/missing input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>
    );

    await screen.findByTestId("HelpRequestForm-submit");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/Requester Email is required./)
    ).toBeInTheDocument();
    expect(screen.getByText(/Team ID is required./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required./)
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
  });

  test("no error messages on good input", async () => {
    const mockSubmitAction = vi.fn(); 

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>
    );

    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "Team42" },
    });
    fireEvent.change(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      {
        target: { value: "Breakout Room A" },
      }
    );
    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2024-01-01T10:00" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Need clarification on project requirements" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));
    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });

  test("navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>
    );

  const cancelButton = await screen.findByTestId("HelpRequestForm-cancel");
  expect(cancelButton).toBeInTheDocument(); 
  fireEvent.click(cancelButton);

  await waitFor(() => expect(mockedNavigate).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
