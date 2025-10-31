import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
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

describe("HelpRequestTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const expectedHeaders = [
      "id",
      "Requester Email",
      "Team Id",
      "Table or Breakout Room",
      "Request Time",
      "Explanation",
      "Solved",
    ];

    const expectedFields = [
      "id",
      "requesterEmail",
      "teamId",
      "tableOrBreakoutRoom",
      "requestTime",
      "explanation",
      "solved",
    ];

    const testId = "HelpRequestTable";

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`)
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1"
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2"
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for admin user", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const expectedHeaders = [
      "id",
      "Requester Email",
      "Team Id",
      "Table or Breakout Room",
      "Request Time",
      "Explanation",
      "Solved",
    ];

    const expectedFields = [
      "id",
      "requesterEmail",
      "teamId",
      "tableOrBreakoutRoom",
      "requestTime",
      "explanation",
      "solved",
    ];

    const testId = "HelpRequestTable";

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`)
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1"
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByTestId(`HelpRequestTable-cell-row-0-col-id`)
      ).toHaveTextContent("1")
    );

    const editButton = screen.getByTestId(
      `HelpRequestTable-cell-row-0-col-Edit-button`
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/helprequest/edit/1")
    );
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/helprequest")
      .reply(200, { message: "HelpRequest deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByTestId(`HelpRequestTable-cell-row-0-col-id`)
      ).toHaveTextContent("1")
    );

    const deleteButton = screen.getByTestId(
      `HelpRequestTable-cell-row-0-col-Delete-button`
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
