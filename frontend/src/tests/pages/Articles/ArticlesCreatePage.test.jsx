import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 1,
      title: "Test Article",
      url: "https://example.com",
      explanation: "This is a test article",
      email: "test@example.com",
      dateAdded: "2022-01-02T12:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("ArticlesForm-title");
    expect(titleInput).toBeInTheDocument();

    const urlInput = screen.getByTestId("ArticlesForm-url");
    expect(urlInput).toBeInTheDocument();

    const explanationInput = screen.getByTestId("ArticlesForm-explanation");
    expect(explanationInput).toBeInTheDocument();

    const emailInput = screen.getByTestId("ArticlesForm-email");
    expect(emailInput).toBeInTheDocument();

    const dateAddedInput = screen.getByTestId("ArticlesForm-dateAdded");
    expect(dateAddedInput).toBeInTheDocument();

    const createButton = screen.getByTestId("ArticlesForm-submit");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "Test Article" } });
    fireEvent.change(urlInput, { target: { value: "https://example.com" } });
    fireEvent.change(explanationInput, {
      target: { value: "This is a test article" },
    });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(dateAddedInput, {
      target: { value: "2022-01-02T12:00:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Test Article",
      url: "https://example.com",
      explanation: "This is a test article",
      email: "test@example.com",
      dateAdded: "2022-01-02T12:00:00",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New article Created - id: 1 title: Test Article",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});

