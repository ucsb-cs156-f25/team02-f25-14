import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBDatesCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";

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

describe("RecommendationRequestCreatePage tests", () => {
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
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("RequesterEmail")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const request = {
      id: 1,
      requesterEmail: "test",
      professorEmail: "test",
      explanation: "explanation",
      dateRequested: "2022-02-02T00:00",
      dateNeeded: "2022-02-02T00:00",
      done: true,
    };

    axiosMock.onPost("/api/recommendationrequests/post").reply(202, request);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("RequesterEmail")).toBeInTheDocument();
    });

    const requesterEmail = screen.getByLabelText("RequesterEmail");
    const professorEmail = screen.getByLabelText("ProfessorEmail");
    const explanation = screen.getByLabelText("Explanation");
    const dateRequested = screen.getByLabelText("DateRequested (iso format)");
    const dateNeeded = screen.getByLabelText("DateNeeded (iso format)");
    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmail, { target: { value: "test1" } });
    fireEvent.change(professorEmail, { target: { value: "test2" } });
    fireEvent.change(explanation, { target: { value: "newExplanation" } });
    fireEvent.change(dateRequested, { target: { value: "2022-02-02T00:00" } });
    fireEvent.change(dateNeeded, { target: { value: "2022-02-02T00:00" } });
    fireEvent.click(screen.getByLabelText("Done?"));
    fireEvent.click(createButton);
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "test1",
      professorEmail: "test2",
      explanation: "newExplanation",
      dateRequested: "2022-02-02T00:00",
      dateNeeded: "2022-02-02T00:00",
      done: true,
    });

    expect(mockToast).toBeCalledWith(
      "New request Created - id: 1 requesteremail: test",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
  });
});
