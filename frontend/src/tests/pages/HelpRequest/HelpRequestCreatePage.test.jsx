import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

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

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("Requester Email"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 1,
      requesterEmail: "cgaucho1@ucsb.edu",
      teamId: "Group12-S25",
      tableOrBreakoutRoom: "Breakout Room",
      requestTime: "2025-05-01T00:00",
      explanation: "Testing",
      solved: true,
    };

    axiosMock.onPost("/api/helprequest/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    const teamIdInput = screen.getByLabelText("Team ID");
    const tableInput = screen.getByLabelText("Table/Breakout Room");
    const requestTimeInput = screen.getByLabelText("Request Time");
    const explanationInput = screen.getByLabelText("Explanation");
    const solvedCheckbox = screen.getByLabelText("Solved");
    const createButton = screen.getByText("Create");

    // fill out form
    fireEvent.change(requesterEmailInput, {
      target: { value: "cgaucho1@ucsb.edu" },
    });
    fireEvent.change(teamIdInput, { target: { value: "Group12-S25" } });
    fireEvent.change(tableInput, { target: { value: "Breakout Room" } });
    fireEvent.change(requestTimeInput, {
      target: { value: "2025-05-01T00:00" },
    });
    fireEvent.change(explanationInput, { target: { value: "Testing" } });
    fireEvent.click(solvedCheckbox);

    // submit form
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // assert correct backend parameters
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "cgaucho1@ucsb.edu",
      teamId: "Group12-S25",
      tableOrBreakoutRoom: "Breakout Room",
      requestTime: "2025-05-01T00:00",
      explanation: "Testing",
      solved: true,
    });

    // toast + redirect
    expect(mockToast).toBeCalledWith(
      "New helpRequest Created - id: 1 requesterEmail: cgaucho1@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
  });
});
