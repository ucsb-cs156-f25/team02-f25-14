import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

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
    useParams: vi.fn(() => ({
      id: 1,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequest", { params: { id: 1 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByText("Edit HelpRequest");
      expect(screen.queryByTestId("HelpRequestForm-requesterEmail")).not.toBeInTheDocument();

      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequest", { params: { id: 1 } }).reply(200, {
        id: 1,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "s22-5pm-3",
        tableOrBreakoutRoom: "7",
        requestTime: "2022-04-20T17:35",
        explanation: "Need help with Swagger-ui",
        solved: false,
      });
      axiosMock.onPut("/api/helprequest").reply(200, {
        id: 1,
        requesterEmail: "ldelplaya@ucsb.edu",
        teamId: "s22-6pm-3",
        tableOrBreakoutRoom: "11",
        requestTime: "2022-04-20T18:31",
        explanation: "Dokku problems",
        solved: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );
      await screen.findByText("Edit HelpRequest");
      await screen.findByTestId("HelpRequestForm-requesterEmail");
      expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
      const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
      const explanationField = screen.getByTestId("HelpRequestForm-explanation");
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(idField).toHaveValue("1");
      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(teamIdField).toHaveValue("s22-5pm-3");
      expect(tableField).toHaveValue("7");
      expect(requestTimeField).toHaveValue("2022-04-20T17:35");
      expect(explanationField).toHaveValue("Need help with Swagger-ui");
      expect(solvedField).not.toBeChecked();
      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
      const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
      const explanationField = screen.getByTestId("HelpRequestForm-explanation");
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      fireEvent.change(requesterEmailField, { target: { value: "ldelplaya@ucsb.edu" } });
      fireEvent.change(teamIdField, { target: { value: "s22-6pm-3" } });
      fireEvent.change(tableField, { target: { value: "11" } });
      fireEvent.change(requestTimeField, { target: { value: "2022-04-20T18:31" } });
      fireEvent.change(explanationField, { target: { value: "Dokku problems" } });
      fireEvent.click(solvedField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "HelpRequest Updated - id: 1 requesterEmail: ldelplaya@ucsb.edu"
      );

      expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          teamId: "s22-6pm-3",
          tableOrBreakoutRoom: "11",
          requestTime: "2022-04-20T18:31",
          explanation: "Dokku problems",
          solved: true,
        })
      );
    });
  });
});