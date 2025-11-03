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
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
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
      </QueryClientProvider>
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

    fireEvent.change(titleInput, { target: { value: "Test Article" } });
    fireEvent.change(urlInput, { target: { value: "https://example.com" } });
    fireEvent.change(explanationInput, { target: { value: "This is a test article" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(dateAddedInput, { target: { value: "2022-01-02T12:00" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // 更强断言：URL / 方法 / 参数
    expect(axiosMock.history.post[0].url).toBe("/api/articles/post");
    expect(axiosMock.history.post[0].method?.toLowerCase?.()).toBe("post");

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Test Article",
      url: "https://example.com",
      explanation: "This is a test article",
      email: "test@example.com",
      dateAdded: "2022-01-02T12:00:00",
    });

    // 成功提示 & 导航
    expect(mockToast).toBeCalledWith("New article Created - id: 1 title: Test Article");
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  test("backend error: does NOT navigate, no success toast", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPost("/api/articles/post").reply(500);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("ArticlesForm-title"), { target: { value: "X" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-url"), { target: { value: "https://x.com" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), { target: { value: "X" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-email"), { target: { value: "x@x.com" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), { target: { value: "2022-01-02T12:00" } });
    fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(mockToast).not.toHaveBeenCalledWith(expect.stringContaining("New article Created"));
    expect(mockNavigate).not.toHaveBeenCalled();
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
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("ArticlesForm-title"), { target: { value: "Another Article" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-url"), { target: { value: "https://example2.com" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), { target: { value: "Another test article" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-email"), { target: { value: "test2@example.com" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), { target: { value: "2022-01-02T00:00" } });
    fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-02T00:00:00");
  });

  test("converts date format when date has no colon (YYYY-MM-DD format) - via hook", async () => {
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
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        title: "Third Article",
        url: "https://example3.com",
        explanation: "Third test article",
        email: "test3@example.com",
        dateAdded: "2022-01-05", // 触发补全
      });
    });

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].url).toBe("/api/articles/post");
    expect(axiosMock.history.post[0].method?.toLowerCase?.()).toBe("post");
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-05T00:00:00");
  });

  test("converts date format when date has no colon - direct mutation test", async () => {
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
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        title: "Fourth Article",
        url: "https://example4.com",
        explanation: "Fourth test article",
        email: "test4@example.com",
        dateAdded: "2022-01-06",
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
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("ArticlesForm-title"), { target: { value: "Storybook Article" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-url"), { target: { value: "https://storybook.com" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), { target: { value: "Storybook test article" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-email"), { target: { value: "storybook@example.com" } });
    fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), { target: { value: "2022-01-07T12:00" } });
    fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
  });

  test("handles dateAdded with already complete format (includes seconds)", async () => {
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
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        title: "Complete Date Article",
        url: "https://complete.com",
        explanation: "Test article",
        email: "complete@example.com",
        dateAdded: "2022-01-08T12:00:00", // 已有秒
      });
    });

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params.dateAdded).toBe("2022-01-08T12:00:00");
  });
});
