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
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const mutationQueryClient = new QueryClient();

    const article = {
      id: 7,
      title: "Awesome Article",
      url: "https://example.com/awesome",
      explanation: "A deep dive into awesome things.",
      email: "author@example.com",
      dateAdded: "2023-11-10T09:30:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={mutationQueryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const urlInput = screen.getByLabelText("URL");
    const explanationInput = screen.getByLabelText("Explanation");
    const emailInput = screen.getByLabelText("Email");
    const dateAddedInput = screen.getByLabelText("Date Added (iso format)");
    const createButton = screen.getByText("Create");

    fireEvent.change(titleInput, {
      target: { value: "Awesome Article" },
    });
    fireEvent.change(urlInput, {
      target: { value: "https://example.com/awesome" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "A deep dive into awesome things." },
    });
    fireEvent.change(emailInput, {
      target: { value: "author@example.com" },
    });
    fireEvent.change(dateAddedInput, {
      target: { value: "2023-11-10T09:30" },
    });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Awesome Article",
      url: "https://example.com/awesome",
      explanation: "A deep dive into awesome things.",
      email: "author@example.com",
      dateAdded: "2023-11-10T09:30:00",
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 7 title: Awesome Article",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});

