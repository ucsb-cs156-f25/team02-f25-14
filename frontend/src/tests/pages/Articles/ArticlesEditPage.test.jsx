import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const useParamsMock = vi.fn(() => ({
  id: 17,
}));

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: () => useParamsMock(),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("ArticlesForm-title")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    let initialArticle;
    let updatedArticle;
    beforeEach(() => {
      vi.clearAllMocks();
      useParamsMock.mockReturnValue({ id: 17 });
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      initialArticle = {
        id: 17,
        title: "Intro to React",
        url: "https://example.com/react",
        explanation: "Basics of React components",
        email: "author@example.com",
        dateAdded: "2023-10-01T12:00:00",
      };
      updatedArticle = {
        ...initialArticle,
        title: "Advanced React",
        url: "https://example.com/react-advanced",
        explanation: "Advanced React patterns",
        email: "editor@example.com",
        dateAdded: "2023-11-10T09:30:00",
      };
      axiosMock
        .onGet("/api/articles", { params: { id: 17 } })
        .reply(200, initialArticle);
      axiosMock.onPut("/api/articles").reply(200, updatedArticle);
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
      useParamsMock.mockReturnValue({ id: 17 });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue(`${initialArticle.id}`);
      expect(titleField).toHaveValue(initialArticle.title);
      expect(urlField).toHaveValue(initialArticle.url);
      expect(explanationField).toHaveValue(initialArticle.explanation);
      expect(emailField).toHaveValue(initialArticle.email);
      expect(dateAddedField).toHaveValue(
        initialArticle.dateAdded.substring(0, 16),
      );

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: updatedArticle.title },
      });
      fireEvent.change(urlField, {
        target: { value: updatedArticle.url },
      });
      fireEvent.change(explanationField, {
        target: { value: updatedArticle.explanation },
      });
      fireEvent.change(emailField, {
        target: { value: updatedArticle.email },
      });
      fireEvent.change(dateAddedField, {
        target: { value: updatedArticle.dateAdded.substring(0, 16) },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Article Updated - id: ${updatedArticle.id} title: ${updatedArticle.title}`,
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toBe("/api/articles");
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: updatedArticle.title,
          url: updatedArticle.url,
          explanation: updatedArticle.explanation,
          email: updatedArticle.email,
          dateAdded: updatedArticle.dateAdded,
        }),
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const titleField = screen.getByTestId("ArticlesForm-title");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(titleField).toHaveValue(initialArticle.title);
      expect(explanationField).toHaveValue(initialArticle.explanation);
      expect(dateAddedField).toHaveValue(
        initialArticle.dateAdded.substring(0, 16),
      );

      fireEvent.change(titleField, {
        target: { value: updatedArticle.title },
      });
      fireEvent.change(explanationField, {
        target: { value: updatedArticle.explanation },
      });
      fireEvent.change(dateAddedField, {
        target: { value: updatedArticle.dateAdded.substring(0, 16) },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Article Updated - id: ${updatedArticle.id} title: ${updatedArticle.title}`,
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });

    test("does not navigate away in storybook mode", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage storybook={true} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      fireEvent.change(titleField, {
        target: { value: updatedArticle.title },
      });
      fireEvent.change(urlField, {
        target: { value: updatedArticle.url },
      });
      fireEvent.change(explanationField, {
        target: { value: updatedArticle.explanation },
      });
      fireEvent.change(emailField, {
        target: { value: updatedArticle.email },
      });
      fireEvent.change(dateAddedField, {
        target: { value: updatedArticle.dateAdded.substring(0, 16) },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Article Updated - id: ${updatedArticle.id} title: ${updatedArticle.title}`,
      );

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText("Edit Article")).toBeInTheDocument();
    });
  });

  describe("when id is not numeric", () => {
    const stringId = "article-xyz";
    const initialArticle = {
      id: stringId,
      title: "Title",
      url: "https://example.com/article",
      explanation: "An article",
      email: "author@example.com",
      dateAdded: "2023-09-15T08:00:00",
    };
    const updatedArticle = {
      ...initialArticle,
      title: "Updated Title",
      explanation: "Updated explanation",
      dateAdded: "2023-09-16T09:30:00",
    };

    beforeEach(() => {
      vi.clearAllMocks();
      useParamsMock.mockReturnValue({ id: stringId });
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/articles", { params: { id: stringId } })
        .reply(200, initialArticle);
      axiosMock.onPut("/api/articles").reply(200, updatedArticle);
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
      useParamsMock.mockReturnValue({ id: 17 });
    });

    const queryClient = new QueryClient();

    test("falls back to string id when route param is non-numeric", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const titleField = screen.getByTestId("ArticlesForm-title");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      fireEvent.change(titleField, {
        target: { value: updatedArticle.title },
      });
      fireEvent.change(explanationField, {
        target: { value: updatedArticle.explanation },
      });
      fireEvent.change(dateAddedField, {
        target: { value: updatedArticle.dateAdded.substring(0, 16) },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Article Updated - id: ${updatedArticle.id} title: ${updatedArticle.title}`,
      );
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: stringId });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        title: updatedArticle.title,
        url: updatedArticle.url,
        explanation: updatedArticle.explanation,
        email: updatedArticle.email,
        dateAdded: updatedArticle.dateAdded,
      });
    });
  });
});
