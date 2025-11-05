import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { recommendationRequestFixture } from "fixtures/recommendationRequestFixture";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("RecommendationRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "RecommendationRequest";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/recommendationrequests/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Create RecommendationRequest/),
      ).toBeInTheDocument();
    });
    const button = screen.getByText(/Create RecommendationRequest/);
    expect(button).toHaveAttribute("href", "/recommendationrequests/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three requests correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/recommendationrequests/all")
      .reply(200, recommendationRequestFixture.threeRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    const createrequestbutton = screen.queryByText(
      "Create RecommendationRequest",
    );
    expect(createrequestbutton).not.toBeInTheDocument();

    const requesteremail = screen.getByText("bob@ucsb.edu");
    expect(requesteremail).toBeInTheDocument();

    const professoremail = screen.getByText("profjessie@ucsb.edu");
    expect(professoremail).toBeInTheDocument();

    //const explanation = screen.getByText("explanation");
    //expect(explanation).toBeInTheDocument();

    // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
    expect(
      screen.queryByTestId(
        "RecommendationRequestTable-cell-row-0-col-Delete-button",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "RecommendationRequestTable-cell-row-0-col-Edit-button",
      ),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/recommendationrequests/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequests/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/recommendationrequests/all")
      .reply(200, recommendationRequestFixture.threeRequests);
    axiosMock
      .onDelete("/api/recommendationrequests")
      .reply(200, "Request with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("Request with id 1 was deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequests");
    expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequests");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
