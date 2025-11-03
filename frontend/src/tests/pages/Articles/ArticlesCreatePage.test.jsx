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
    const queryClient = new QueryClient();
    const article = {
      id: 3,
      title: "Third Article",
      url: "https://example3.com",
      explanation: "Third test article",
      email: "test3@example.com",
      dateAdded: "2022-01-05T00:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    const { container } = render(
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

    // Fill in all required fields
    fireEvent.change(titleInput, { target: { value: "Third Article" } });
    fireEvent.change(urlInput, { target: { value: "https://example3.com" } });
    fireEvent.change(explanationInput, {
      target: { value: "Third test article" },
    });
    fireEvent.change(emailInput, { target: { value: "test3@example.com" } });

    // To test the "no colon" branch, we need to bypass form validation.
    // We'll directly manipulate the input value and use fireEvent.submit
    // to trigger the form submission, which will call the mutation with the date.
    Object.defineProperty(dateAddedInput, "value", {
      writable: true,
      value: "2022-01-05",
    });

    // Use fireEvent.change to update react-hook-form's internal state
    fireEvent.change(dateAddedInput, { target: { value: "2022-01-05" } });

    // Directly submit the form to bypass validation
    const form = container.querySelector("form");
    fireEvent.submit(form);

    // Wait for the mutation to complete
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // Verify that the date was converted correctly (YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss)
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-05T00:00:00");
  });
});

