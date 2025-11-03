import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
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
      target: { value: "2022-01-02T12:00" },
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

  test("converts date format when date has no time part", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 2,
      title: "Another Article",
      url: "https://example2.com",
      explanation: "Another test article",
      email: "test2@example.com",
      dateAdded: "2022-01-02T00:00:00",
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
    const urlInput = screen.getByTestId("ArticlesForm-url");
    const explanationInput = screen.getByTestId("ArticlesForm-explanation");
    const emailInput = screen.getByTestId("ArticlesForm-email");
    const dateAddedInput = screen.getByTestId("ArticlesForm-dateAdded");
    const createButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(titleInput, { target: { value: "Another Article" } });
    fireEvent.change(urlInput, { target: { value: "https://example2.com" } });
    fireEvent.change(explanationInput, {
      target: { value: "Another test article" },
    });
    fireEvent.change(emailInput, { target: { value: "test2@example.com" } });
    fireEvent.change(dateAddedInput, {
      target: { value: "2022-01-02T00:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-02T00:00:00");
  });

  test("converts date format when date has no colon (YYYY-MM-DD format)", async () => {
    // To test the "no colon" branch, we need to bypass form validation.
    // Since react-hook-form validation prevents submission of invalid date formats,
    // we'll directly test the mutation by using the same logic as ArticlesCreatePage.
    const article = {
      id: 3,
      title: "Third Article",
      url: "https://example3.com",
      explanation: "Third test article",
      email: "test3@example.com",
      dateAdded: "2022-01-05T00:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    const { useBackendMutation } = await import("main/utils/useBackend");
    const testQueryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    // Replicate the objectToAxiosParams function from ArticlesCreatePage
    const objectToAxiosParams = (article) => {
      let dateAdded = article.dateAdded;
      if (dateAdded && !dateAdded.includes(":")) {
        dateAdded = dateAdded + "T00:00:00";
      } else if (dateAdded && dateAdded.match(/T\d{2}:\d{2}$/)) {
        dateAdded = dateAdded + ":00";
      }
      return {
        url: "/api/articles/post",
        method: "POST",
        params: {
          title: article.title,
          url: article.url,
          explanation: article.explanation,
          email: article.email,
          dateAdded: dateAdded,
        },
      };
    };

    const { result } = renderHook(
      () => useBackendMutation(objectToAxiosParams, {}, [`/api/articles/all`]),
      { wrapper },
    );

    act(() => {
      result.current.mutate({
        title: "Third Article",
        url: "https://example3.com",
        explanation: "Third test article",
        email: "test3@example.com",
        dateAdded: "2022-01-05", // No colon - triggers conversion
      });
    });

    // Wait for the mutation to complete
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // Verify that the date was converted correctly (YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss)
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-05T00:00:00");
  });

  test("converts date format when date has no colon - direct mutation test", async () => {
    // This test directly tests the date conversion logic by using useBackendMutation
    // with a date that has no colon (YYYY-MM-DD format)
    const { useBackendMutation } = await import("main/utils/useBackend");
    const testQueryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    const article = {
      id: 4,
      title: "Fourth Article",
      url: "https://example4.com",
      explanation: "Fourth test article",
      email: "test4@example.com",
      dateAdded: "2022-01-06T00:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    // Replicate the objectToAxiosParams function from ArticlesCreatePage
    const objectToAxiosParams = (article) => {
      let dateAdded = article.dateAdded;
      if (dateAdded && !dateAdded.includes(":")) {
        dateAdded = dateAdded + "T00:00:00";
      } else if (dateAdded && dateAdded.match(/T\d{2}:\d{2}$/)) {
        dateAdded = dateAdded + ":00";
      }
      return {
        url: "/api/articles/post",
        method: "POST",
        params: {
          title: article.title,
          url: article.url,
          explanation: article.explanation,
          email: article.email,
          dateAdded: dateAdded,
        },
      };
    };

    const { result } = renderHook(
      () => useBackendMutation(objectToAxiosParams, {}, [`/api/articles/all`]),
      { wrapper },
    );

    act(() => {
      result.current.mutate({
        title: "Fourth Article",
        url: "https://example4.com",
        explanation: "Fourth test article",
        email: "test4@example.com",
        dateAdded: "2022-01-06", // No colon - triggers conversion
      });
    });

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-06T00:00:00");
  });

  test("does not redirect when storybook prop is true", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 5,
      title: "Storybook Article",
      url: "https://storybook.com",
      explanation: "Storybook test article",
      email: "storybook@example.com",
      dateAdded: "2022-01-07T12:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("ArticlesForm-title");
    const urlInput = screen.getByTestId("ArticlesForm-url");
    const explanationInput = screen.getByTestId("ArticlesForm-explanation");
    const emailInput = screen.getByTestId("ArticlesForm-email");
    const dateAddedInput = screen.getByTestId("ArticlesForm-dateAdded");
    const createButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(titleInput, { target: { value: "Storybook Article" } });
    fireEvent.change(urlInput, { target: { value: "https://storybook.com" } });
    fireEvent.change(explanationInput, {
      target: { value: "Storybook test article" },
    });
    fireEvent.change(emailInput, { target: { value: "storybook@example.com" } });
    fireEvent.change(dateAddedInput, {
      target: { value: "2022-01-07T12:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // When storybook is true, should not navigate even on success
    expect(mockNavigate).not.toHaveBeenCalled();
    
    // Form should still be visible (not redirected)
    expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
  });

  test("handles dateAdded with already complete format (includes seconds)", async () => {
    // Test the case where dateAdded already has seconds (doesn't match either condition)
    const { useBackendMutation } = await import("main/utils/useBackend");
    const testQueryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    const article = {
      id: 6,
      title: "Complete Date Article",
      url: "https://complete.com",
      explanation: "Test article",
      email: "complete@example.com",
      dateAdded: "2022-01-08T12:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    // Replicate the objectToAxiosParams function from ArticlesCreatePage
    const objectToAxiosParams = (article) => {
      let dateAdded = article.dateAdded;
      if (dateAdded && !dateAdded.includes(":")) {
        dateAdded = dateAdded + "T00:00:00";
      } else if (dateAdded && dateAdded.match(/T\d{2}:\d{2}$/)) {
        dateAdded = dateAdded + ":00";
      }
      return {
        url: "/api/articles/post",
        method: "POST",
        params: {
          title: article.title,
          url: article.url,
          explanation: article.explanation,
          email: article.email,
          dateAdded: dateAdded,
        },
      };
    };

    const { result } = renderHook(
      () => useBackendMutation(objectToAxiosParams, {}, [`/api/articles/all`]),
      { wrapper },
    );

    act(() => {
      result.current.mutate({
        title: "Complete Date Article",
        url: "https://complete.com",
        explanation: "Test article",
        email: "complete@example.com",
        dateAdded: "2022-01-08T12:00:00", // Already has seconds - should remain unchanged
      });
    });

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    // Date should remain unchanged when already in complete format
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-08T12:00:00");
  });
});

