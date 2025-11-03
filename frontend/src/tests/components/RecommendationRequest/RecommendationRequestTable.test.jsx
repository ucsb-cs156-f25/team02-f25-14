import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { recommendationRequestFixture} from "fixtures/recommendationRequestFixture";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["id", "Requester Email", "Professor Email", "Explanation", "Date Requested", "Date Needed", "Done"];
  const expectedFields = ["id", "requesteremail", "professoremail", "explanation", "daterequested", "dateneeded", "done"];
  const testId = "RecommendationRequest";

  test("renders empty table correctly", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable recommendationrequest={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationrequest={recommendationRequestFixture.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesteremail`),
    ).toHaveTextContent("bob@ucsb.edu");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-professoremail`),
    ).toHaveTextContent("profevan@ucsb.edu");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationrequest={recommendationRequestFixture.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
        const header = screen.getByText(headerText);
        expect(header).toBeInTheDocument();
      });
  
      expectedFields.forEach((field) => {
        const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
        expect(header).toBeInTheDocument();
      });
  
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
        "1",
      );
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-requesteremail`),
      ).toHaveTextContent("bob@ucsb.edu");
  
      expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
        "2",
      );
      expect(
        screen.getByTestId(`${testId}-cell-row-1-col-professoremail`),
      ).toHaveTextContent("profevan@ucsb.edu");

    expect(screen.queryByTestId("RecommendationRequest-cell-row-0-col-Edit-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("RecommendationRequest-cell-row-0-col-Delete-button")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationrequest={recommendationRequestFixture.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesteremail`),
    ).toHaveTextContent("bob@ucsb.edu");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    // act - click the edit button
    fireEvent.click(editButton);

    // assert - check that the navigate function was called with the expected path
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/recommendationrequests/edit/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequests")
      .reply(200, { message: "Request deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            recommendationrequest={recommendationRequestFixture.threeRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesteremail`),
    ).toHaveTextContent("bob@ucsb.edu");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});